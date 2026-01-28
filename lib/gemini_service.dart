import 'package:google_generative_ai/google_generative_ai.dart';

enum AppLanguage {
  english,
  chinese,
}

enum Persona { advisor, boss, client, colleague, seniorPeer }

class PersonaConfig {
  final String labelEn;
  final String labelZh;
  final String icon;
  final String promptInstruction;

  const PersonaConfig({
    required this.labelEn,
    required this.labelZh,
    required this.icon,
    required this.promptInstruction,
  });
}

final Map<Persona, PersonaConfig> personaConfigs = {
  Persona.advisor: PersonaConfig(
    labelEn: 'Graduate Advisor',
    labelZh: '导师/教授',
    icon: '🎓',
    promptInstruction:
        'Role: Student replying to a Professor. Tone: Respectful but proactive. Avoid empty flattery. Focus on "Action Taken".',
  ),
  Persona.boss: PersonaConfig(
    labelEn: 'Boss',
    labelZh: '老板/上司',
    icon: '💼',
    promptInstruction:
        'Role: Employee replying to a Boss. Tone: Professional, concise, and outcome-focused. No fluff.',
  ),
  Persona.client: PersonaConfig(
    labelEn: 'Client',
    labelZh: '客户/甲方',
    icon: '🤝',
    promptInstruction:
        'Role: Vendor replying to a Client. Tone: Service-oriented, polite, and reassuring.',
  ),
  Persona.colleague: PersonaConfig(
    labelEn: 'Colleague',
    labelZh: '同事',
    icon: '👋',
    promptInstruction:
        'Role: Coworker replying to a peer. Tone: Collaborative, clear, and friendly.',
  ),
  Persona.seniorPeer: PersonaConfig(
    labelEn: 'Senior Peer',
    labelZh: '前辈/师兄姐',
    icon: '🌟',
    promptInstruction:
        'Role: Replying to a senior peer. Tone: Respectful but authoritative on your own domain.',
  ),
};

class GeminiService {
  late final GenerativeModel _model;
  final String? _apiKey;

  GeminiService() : _apiKey = const String.fromEnvironment('API_KEY') {
    if (_apiKey == null || _apiKey!.isEmpty) {
      print('WARNING: API_KEY is missing. Use --dart-define=API_KEY=...');
    }
    _model = GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: _apiKey ?? 'DUMMY_KEY',
    );
  }

  Future<String> polishText({
    required String draft,
    required String context,
    required String thoughts,
    required Persona persona,
    required AppLanguage language,
  }) async {
    if (draft.trim().isEmpty) return "";

    final config = personaConfigs[persona]!;
    
    // Language-specific instructions
    String langInstruction;
    if (language == AppLanguage.chinese) {
      langInstruction = '''
OUTPUT LANGUAGE: Simplified Chinese (简体中文).
STYLE RULES (Chinese):
- Format: Native IM Chat (WeChat/DingTalk).
- Tone: Natural, grounded (接地气).
- PROHIBITED: "Translationese" (e.g., avoid "秉持", "致以", "deeply regret"). Avoid robotic/stiff phrasing.
- If Persona is Advisor: Be sincere and proactive (e.g., use "收到老师" instead of "Read").
''';
    } else {
      langInstruction = '''
OUTPUT LANGUAGE: English.
STYLE RULES (English):
- Format: Native IM Chat (Slack/Teams).
- Tone: Idiomatic, professional but not stiff.
- PROHIBITED: Textbook English. make it sound like a native speaker.
''';
    }

    final prompt = '''
You are a sophisticated communication assistant.

$langInstruction

INPUT DATA:
1. INCOMING MESSAGE (Context):
"${context.trim().isEmpty ? "No context provided" : context}"

2. USER DRAFT (Content Source):
"$draft"

3. INNER THOUGHTS (Tone Modifier):
"${thoughts.trim().isEmpty ? "No internal thoughts provided" : thoughts}"

COMMON SAFETY RULE: Convert negative emotions in [Inner Thoughts] to high-EQ professional language suitable for the target persona.

TARGET PERSONA:
${config.promptInstruction}

TASK:
Rewrite the draft based on the context and persona. Return ONLY the rewritten text.
''';

    try {
      final response = await _model.generateContent([Content.text(prompt)]);
      return response.text ?? "Could not generate response.";
    } catch (e) {
      print('Gemini API Error: $e');
      return "Error: Check your API Key or connection.";
    }
  }
}
