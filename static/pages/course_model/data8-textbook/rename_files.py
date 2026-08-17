import os
import csv

root = 'chapters'  # Update this path if needed
csv_path = os.path.join(os.path.dirname(__file__), 'file_list.csv')

if(False):
    file_list = []

    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            if filename.lower().endswith(('.md', '.ipynb')):
                full_path = os.path.join(dirpath, filename)
                ext = os.path.splitext(filename)[1]
                file_list.append([full_path, filename, ext])

    with open(csv_path, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['path', 'filename', 'extension'])
        writer.writerows(file_list)

    print(f"CSV written to {csv_path} with {len(file_list)} files.")


def print_markdown_links_from_csv(csv_file):
    with open(csv_file, newline='') as csvfile:
        reader = list(csv.DictReader(csvfile))
        # Sort rows by path
        reader.sort(key=lambda row: row['path'])
        for row in reader:
            rel_path = row['path']
            parts = os.path.splitext(rel_path)[0].split(os.sep)
            if parts[0] == 'chapters':
                parts = parts[1:]
            parts[-1] = ' ' + parts[-1]
            title = ".".join( [p.replace('_', ' ').replace('-', ' ') for p in parts])
            title = title.title()
            print(f"- [{title}](data8-textbook/{rel_path})")

# Uncomment to run after CSV is created:
print_markdown_links_from_csv(csv_path)