import os
import re
import sys

def fix_markdown(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # MD031: Fenced code blocks should be surrounded by blank lines
    content = re.sub(r'([^\n])\n(```|~~~)', r'\1\n\n\2', content)
    content = re.sub(r'(```|~~~)\n([^\n])', r'\1\n\n\2', content)

    # MD032: Lists should be surrounded by blank lines
    # Only if it's not already preceded by a list item or a blank line or a header
    # This one is tricky. Let's do a simpler version first.
    # If a line starts with - or * or + and the previous line is not a blank line and doesn't start with - or * or + or #
    def fix_md032(match):
        prev_line = match.group(1)
        curr_line = match.group(2)
        if prev_line.strip() == '' or prev_line.strip().startswith(('#', '-', '*', '+', '>')):
            return match.group(0)
        return prev_line + '\n\n' + curr_line

    content = re.sub(r'([^\n]+\n)([-*+] [^\n]+)', fix_md032, content)

    # MD007: Unordered list indentation
    content = re.sub(r'^  ([-*+]) ', r'    \1 ', content, flags=re.MULTILINE)

    # MD040: Fenced code blocks should have a language specified
    def fix_md040(match):
        fence = match.group(1)
        lang = match.group(2)
        code = match.group(3)
        if not lang:
            if '{' in code and '}' in code:
                return f'{fence}json\n{code}{fence}'
            else:
                return f'{fence}text\n{code}{fence}'
        return match.group(0)

    content = re.sub(r'(^|\n)(```|~~~)([^\n]*)\n([\s\S]*?)\n(```|~~~)', fix_md040, content)

    # MD034: Bare URL
    content = re.sub(r'(?<!<)(https?://[^\s)\]]+)(?!>)', r'<\1>', content)

    # MD038/MD039: Spaces inside code span / link
    content = re.sub(r'` ([^`]+?) `', r'`\1`', content)
    content = re.sub(r'\[ ([^\]]+?) \]', r'[\1]', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    if os.path.isfile(target):
        fix_markdown(target)
    else:
        for root, dirs, files in os.walk(target):
            if "node_modules" in dirs:
                dirs.remove("node_modules")
            for file in files:
                if file.endswith(".md"):
                    fix_markdown(os.path.join(root, file))
