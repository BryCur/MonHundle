
import os 
import json

def clean_line(s: str) -> str :
    return s.replace('=', '').replace('[', '').replace(']', '').strip()

def get_first_game(s: str) -> str : 
    start_str = "Game=[["
    end_str = "]]|"
    starting_index = s.find(start_str) + len(start_str)
    ending_index = s.find(end_str, starting_index)

    return s[starting_index:ending_index]

all_mons = []
with open('./data/monster_list.txt', 'r', encoding='UTF-8') as reader: 
    first_game = ''
    order = ''
    for line in  reader.readlines():
        if '===[[' in line: 
            order = clean_line(line)
            
        elif "|" in line: 
            try: 
                all_mons.append({
                    'name' : line.split('|')[2],
                    'class': order,
                    'first_game': get_first_game(line),
                    'generation': 0
                })
            except: 
                print(line)
                


with open('./monsters.json', 'w') as writer:
    json.dump(all_mons, writer)

print(f'saved {len(all_mons)} items')