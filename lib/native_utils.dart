import 'dart:io';

/// Simulates a system "Copy" command (Ctrl+C or Cmd+C)
/// by executing native OS scripts.
Future<void> simulateCopy() async {
  try {
    if (Platform.isWindows) {
      // Windows: Use PowerShell to send Ctrl+C
      await Process.run(
        'powershell',
        [
          '-c',
          "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^c')"
        ],
      );
    } else if (Platform.isMacOS) {
      // macOS: Use AppleScript to send Cmd+C
      await Process.run(
        'osascript',
        ['-e', 'tell application "System Events" to keystroke "c" using {command down}'],
      );
    }
  } catch (e) {
    print("Error simulating copy: $e");
  }
}
