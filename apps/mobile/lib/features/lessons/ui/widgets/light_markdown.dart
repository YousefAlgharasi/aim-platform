import 'package:flutter/material.dart';

/// Light markdown for lesson text: `**bold**`, lines starting with `- ` / `* ` and `1. `. Everything else is plain text.
class LightMarkdown extends StatelessWidget {
  const LightMarkdown({super.key, required this.text, required this.style});

  final String text;
  final TextStyle style;

  static final _bullet = RegExp(r'^\s*[-*•]\s+(.*)$');
  static final _numbered = RegExp(r'^\s*(\d+)[.)]\s+(.*)$');

  @override
  Widget build(BuildContext context) {
    final rows = <Widget>[];
    for (final raw in text.split('\n')) {
      final line = raw.trimRight();
      if (line.trim().isEmpty) continue;
      final b = _bullet.firstMatch(line);
      final n = _numbered.firstMatch(line);
      if (b != null || n != null) {
        final marker = n != null ? '${n.group(1)}.' : '•';
        final content = (b?.group(1) ?? n!.group(2))!;
        rows.add(Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 22,
                child: Text(marker, style: style),
              ),
              Expanded(child: Text.rich(_inline(content, style))),
            ],
          ),
        ));
      } else {
        rows.add(Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text.rich(_inline(line, style)),
        ));
      }
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: rows);
  }

  static TextSpan _inline(String s, TextStyle base) {
    final spans = <InlineSpan>[];
    final parts = s.split('**');
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].isEmpty) continue;
      spans.add(TextSpan(
        text: parts[i],
        style: i.isOdd
            ? base.copyWith(
                fontWeight: FontWeight.w800,
                color: base.color,
              )
            : null,
      ));
    }
    return TextSpan(style: base, children: spans);
  }
}
