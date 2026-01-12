
import sys

def check_braces(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    depth = 0
    in_style = False
    style_start_line = 0
    
    for i, line in enumerate(lines):
        line_num = i + 1
        
        if '<style' in line:
            in_style = True
            style_start_line = line_num
            depth = 0
            print(f"Style section starts at line {line_num}")
            continue
            
        if '</style>' in line:
            in_style = False
            print(f"Style section ends at line {line_num}. Final depth: {depth}")
            continue
            
        if in_style:
            # Simple comment stripping (not perfect for all cases but good for this)
            clean_line = line.split('//')[0]
            # Handle /* */ comments roughly
            if '/*' in clean_line and '*/' in clean_line:
                # remove content between /* and */
                pass 
            
            for char in clean_line:
                if char == '{':
                    depth += 1
                elif char == '}':
                    depth -= 1
                    if depth < 0:
                        print(f"Error: Extra closing brace at line {line_num}: {line.strip()}")
                        depth = 0 # reset to continue
            
            # Optional: print depth for debugging large jumps
            # if depth != previous_depth: print(f"Line {line_num}: depth {depth}")

    if depth > 0:
        print(f"Error: {depth} unclosed braces at the end of style section.")

if __name__ == "__main__":
    check_braces('src/views/account/index.vue')
