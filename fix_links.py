import re

filepath = '/Users/fengrr/Desktop/vue-pure-admin-max/doc/backend/course-discussion-api.md'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove number prefixes from headers like ### 1. 获取讨论列表 -> ### 获取讨论列表
content = re.sub(r'^(#+) [T\d]+\. ', r'\1 ', content, flags=re.MULTILINE)

# Update links in TOC and tables
# Find all occurrences of [Link Text](#number-link) and remove the number-
content = re.sub(r'\[([^\]]+)\]\(#[T\d]+-([^\)]+)\)', r'[\1](#\2)', content)

# Also fix the specific TOC items that have numbers outside the link
content = re.sub(r'^\d+\. \[([^\]]+)\]\(#([^\)]+)\)', r'- [\1](#\2)', content, flags=re.MULTILINE)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
