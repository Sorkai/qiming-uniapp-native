import re

filepath = '/Users/fengrr/Desktop/vue-pure-admin-max/doc/backend/course-discussion-api.md'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Lowercase all fragments in links
content = re.sub(r'\(#([^\)]+)\)', lambda m: '(#%s)' % m.group(1).lower(), content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
