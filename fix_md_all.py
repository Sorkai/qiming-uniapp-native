import re
import os
import sys

def fix_markdown_content(content):
    # Fix MD040: Fenced code blocks should have a language
    # If it's just ``` followed by a newline, try to guess or use text
    # Often in these docs, it's followed by { or [, indicating JSON
    def replace_code_block(match):
        prefix = match.group(1) # ```
        rest = match.group(2)
        if rest.strip().startswith('{') or rest.strip().startswith('['):
            return f'```json\n{rest}'
        return f'```text\n{rest}'
    
    content = re.sub(r'(^|\n)```\s*\n(.*?)(?=\n```)', lambda m: m.group(1) + replace_code_block(m), content, flags=re.DOTALL)

    # Fix MD007: Unordered list indentation (2 spaces to 4 spaces)
    # This matches a list item that is indented by exactly 2 spaces
    content = re.sub(r'^  ([-*+]) ', r'    \1 ', content, flags=re.MULTILINE)
    # Handle nested lists if any (though usually it's just one level)
    # content = re.sub(r'^    ([-*+]) ', r'        \1 ', content, flags=re.MULTILINE)

    # Fix MD034: Bare URLs
    # Wrap URLs that are not in []() or <>
    def wrap_url(match):
        url = match.group(0)
        # Check context
        start = match.start()
        end = match.end()
        if start > 0 and content[start-1] in '(<[':
            return url
        if end < len(content) and content[end] in ')>]':
            return url
        return f'<{url}>'

    # Safe URL regex
    url_pattern = re.compile(r'https?://[a-zA-Z0-9\-\.\/\?\%\&\=\#\:\_]+')
    # Actually, let's only do this for known domains or patterns to avoid breaking things
    # content = url_pattern.sub(wrap_url, content)

    # Fix MD038/MD039: Spaces in code/links
    content = re.sub(r'\[\s+([^\]]+)\s+\]\(', r'[\1](', content)
    content = re.sub(r'\[\s+([^\]]+)\]\(', r'[\1](', content)
    content = re.sub(r'\[([^\]]+)\s+\]\(', r'[\1](', content)
    content = re.sub(r'`\s+([^`]+)\s+`', r'`\1`', content)
    
    # Specific common patterns in this project
    content = re.sub(r'最新文档站地址：(https?://[^\s\n<]+)', r'最新文档站地址：<\1>', content)
    content = re.sub(r'最新完整版预览站地址：(https?://[^\s\n<]+)', r'最新完整版预览站地址：<\1>', content)
    content = re.sub(r'测试地址 (https?://[^\s\n<]+)', r'测试地址 <\1>', content)
    content = re.sub(r'The latest document site address: (https?://[^\s\n<]+)', r'The latest document site address: <\1>', content)
    content = re.sub(r'The latest full version preview site address: (https?://[^\s\n<]+)', r'The latest full version preview site address: <\1>', content)

    return content

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed = fix_markdown_content(content)
        
        if fixed != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f"Fixed: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else 'doc'
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.md'):
                process_file(os.path.join(root, file))
    
    # Also handle root changelogs
    for file in os.listdir('.'):
        if file.startswith('CHANGELOG') and file.endswith('.md'):
            process_file(file)
