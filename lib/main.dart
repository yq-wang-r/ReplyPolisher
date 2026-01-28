import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hotkey_manager/hotkey_manager.dart';
import 'package:window_manager/window_manager.dart';
import 'package:screen_retriever/screen_retriever.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'native_utils.dart';
import 'gemini_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await windowManager.ensureInitialized();
  await hotKeyManager.unregisterAll();

  WindowOptions windowOptions = const WindowOptions(
    size: Size(450, 700),
    center: true,
    backgroundColor: Colors.transparent,
    skipTaskbar: false,
    titleBarStyle: TitleBarStyle.hidden,
    alwaysOnTop: true,
  );

  await windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.hide(); 
  });

  runApp(const ReplyPolisherApp());
}

class ReplyPolisherApp extends StatefulWidget {
  const ReplyPolisherApp({super.key});

  @override
  State<ReplyPolisherApp> createState() => _ReplyPolisherAppState();
}

class _ReplyPolisherAppState extends State<ReplyPolisherApp> {
  AppLanguage _language = AppLanguage.chinese; // Default

  void _toggleLanguage() {
    setState(() {
      _language = _language == AppLanguage.english
          ? AppLanguage.chinese
          : AppLanguage.english;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Switch font based on language
    final textTheme = _language == AppLanguage.chinese
        ? GoogleFonts.notoSansScTextTheme()
        : GoogleFonts.interTextTheme();

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        textTheme: textTheme,
      ),
      home: PopupHome(
        currentLanguage: _language,
        onToggleLanguage: _toggleLanguage,
      ),
    );
  }
}

class PopupHome extends StatefulWidget {
  final AppLanguage currentLanguage;
  final VoidCallback onToggleLanguage;

  const PopupHome({
    super.key,
    required this.currentLanguage,
    required this.onToggleLanguage,
  });

  @override
  State<PopupHome> createState() => _PopupHomeState();
}

class _PopupHomeState extends State<PopupHome> with WindowListener {
  final GeminiService _geminiService = GeminiService();
  
  // State
  final TextEditingController _contextController = TextEditingController();
  final TextEditingController _draftController = TextEditingController();
  final TextEditingController _thoughtsController = TextEditingController();
  final FocusNode _draftFocusNode = FocusNode();
  
  String _outputText = "";
  bool _isLoading = false;
  Persona _selectedPersona = Persona.boss;
  
  final HotKey _hotKey = HotKey(
    key: PhysicalKeyboardKey.keyX,
    modifiers: [HotKeyModifier.alt],
    scope: HotKeyScope.system,
  );

  // Localization Map
  final Map<String, Map<AppLanguage, String>> _strings = {
    'contextTitle': {
      AppLanguage.english: 'Context (Captured):',
      AppLanguage.chinese: '上下文 (已捕获):'
    },
    'draftLabel': {
      AppLanguage.english: 'Your Draft',
      AppLanguage.chinese: '你的草稿'
    },
    'draftHint': {
      AppLanguage.english: "e.g., ok i'll do it",
      AppLanguage.chinese: "例如：好的，我这就去做"
    },
    'thoughtsHint': {
      AppLanguage.english: "Hidden thoughts (e.g. 'I'm annoyed')",
      AppLanguage.chinese: "内心潜台词 (例如：'我有点烦')"
    },
    'polishButton': {
      AppLanguage.english: "Polish (Alt+Enter)",
      AppLanguage.chinese: "润色 (Alt+Enter)"
    },
    'polishing': {
      AppLanguage.english: "Polishing...",
      AppLanguage.chinese: "正在润色..."
    },
    'copyButton': {
      AppLanguage.english: "Copy to Clipboard",
      AppLanguage.chinese: "复制到剪贴板"
    },
    'copied': {
      AppLanguage.english: "Copied!",
      AppLanguage.chinese: "已复制!"
    },
  };

  String tr(String key) => _strings[key]?[widget.currentLanguage] ?? key;

  @override
  void initState() {
    super.initState();
    windowManager.addListener(this);
    _initHotKeys();
  }

  @override
  void dispose() {
    windowManager.removeListener(this);
    _draftFocusNode.dispose();
    super.dispose();
  }

  Future<void> _initHotKeys() async {
    await hotKeyManager.register(
      _hotKey,
      keyDownHandler: (hotKey) => _handleGlobalTrigger(),
    );
  }

  Future<void> _handleGlobalTrigger() async {
    await simulateCopy();
    await Future.delayed(const Duration(milliseconds: 250));

    ClipboardData? data = await Clipboard.getData(Clipboard.kTextPlain);
    String clippedText = data?.text ?? "";

    setState(() {
      _contextController.text = clippedText;
      _draftController.clear();
      _thoughtsController.clear();
      _outputText = "";
    });

    Offset mousePos = await screenRetriever.getCursorScreenPoint();
    await windowManager.setPosition(Offset(mousePos.dx, mousePos.dy + 20));
    
    if (!await windowManager.isVisible()) {
      await windowManager.show();
    }
    await windowManager.focus();
    _draftFocusNode.requestFocus();
  }

  Future<void> _polishText() async {
    if (_draftController.text.trim().isEmpty) return;

    setState(() => _isLoading = true);
    
    try {
      final result = await _geminiService.polishText(
        draft: _draftController.text,
        context: _contextController.text,
        thoughts: _thoughtsController.text,
        persona: _selectedPersona,
        language: widget.currentLanguage,
      );
      setState(() => _outputText = result);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _copyToClipboard() {
    Clipboard.setData(ClipboardData(text: _outputText));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(tr('copied')), duration: const Duration(seconds: 1)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Center(
        child: Container(
          width: 420,
          constraints: const BoxConstraints(maxHeight: 680),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 20,
                offset: const Offset(0, 10),
              )
            ],
            border: Border.all(color: Colors.grey.shade200, width: 1),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // --- Header ---
              GestureDetector(
                onPanStart: (details) => windowManager.startDragging(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(LucideIcons.messageSquareQuote, size: 18, color: Colors.blue),
                          SizedBox(width: 8),
                          Text("ReplyPolisher", style: TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Row(
                        children: [
                          // Language Toggle
                          InkWell(
                            onTap: widget.onToggleLanguage,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border.all(color: Colors.grey.shade300),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                widget.currentLanguage == AppLanguage.english ? 'EN' : '中',
                                style: TextStyle(
                                  fontSize: 12, 
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blue.shade700
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            icon: const Icon(LucideIcons.x, size: 16),
                            onPressed: () => windowManager.hide(),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              ),

              // --- Content ---
              Flexible(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  shrinkWrap: true,
                  children: [
                    // Context Field
                    if (_contextController.text.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.blue.shade100),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(tr('contextTitle'), 
                                style: TextStyle(fontSize: 10, color: Colors.blue.shade800, fontWeight: FontWeight.bold)
                              ),
                              const SizedBox(height: 4),
                              Text(_contextController.text, 
                                maxLines: 3, 
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 12, color: Colors.blue.shade900)
                              ),
                            ],
                          ),
                        ),
                      ),

                    // Draft Input
                    TextField(
                      controller: _draftController,
                      focusNode: _draftFocusNode,
                      maxLines: 3,
                      minLines: 2,
                      decoration: InputDecoration(
                        labelText: tr('draftLabel'),
                        hintText: tr('draftHint'),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.all(12),
                        filled: true,
                        fillColor: Colors.white,
                      ),
                      onSubmitted: (_) => _polishText(),
                    ),
                    const SizedBox(height: 12),

                    // Inner Thoughts
                    TextField(
                      controller: _thoughtsController,
                      maxLines: 1,
                      style: const TextStyle(fontSize: 12),
                      decoration: InputDecoration(
                        prefixIcon: const Icon(LucideIcons.brainCircuit, size: 14, color: Colors.indigo),
                        hintText: tr('thoughtsHint'),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none
                        ),
                        filled: true,
                        fillColor: Colors.indigo.shade50.withOpacity(0.5),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Persona Selector
                    SizedBox(
                      height: 40,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: Persona.values.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final p = Persona.values[index];
                          final config = personaConfigs[p]!;
                          final isSelected = _selectedPersona == p;
                          // Choose label based on language
                          final label = widget.currentLanguage == AppLanguage.chinese ? config.labelZh : config.labelEn;
                          
                          return ChoiceChip(
                            label: Text(label),
                            avatar: Text(config.icon),
                            selected: isSelected,
                            onSelected: (val) => setState(() => _selectedPersona = p),
                            showCheckmark: false,
                            labelStyle: TextStyle(
                              fontSize: 11,
                              color: isSelected ? Colors.white : Colors.black87,
                            ),
                            selectedColor: Colors.blue.shade600,
                            backgroundColor: Colors.grey.shade100,
                            side: BorderSide.none,
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Action Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: (_isLoading || _draftController.text.isEmpty) ? null : _polishText,
                        icon: _isLoading 
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(LucideIcons.wand2, size: 16),
                        label: Text(_isLoading ? tr('polishing') : tr('polishButton')),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue.shade600,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),

                    // Output
                    if (_outputText.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.green.shade100),
                        ),
                        child: Column(
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Text(
                                _outputText,
                                style: TextStyle(color: Colors.green.shade900, height: 1.4),
                              ),
                            ),
                            Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                border: Border(top: BorderSide(color: Colors.green.shade200.withOpacity(0.5))),
                              ),
                              child: TextButton.icon(
                                onPressed: _copyToClipboard,
                                icon: const Icon(LucideIcons.copy, size: 14),
                                label: Text(tr('copyButton')),
                                style: TextButton.styleFrom(
                                  foregroundColor: Colors.green.shade700,
                                  visualDensity: VisualDensity.compact,
                                ),
                              ),
                            )
                          ],
                        ),
                      ).animate().fadeIn().slideY(begin: 0.1, end: 0),
                    ]
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
