from faker import Factory
import numpy as np

fake = Factory.create()
total = 100 
average = 10
rentals = np.random.poisson(average, total)
book_probs = np.random.poisson(average, total)
book_ps = [probability / sum(book_probs) for probability in book_probs]
members = [{} for _ in range(0, total)]
books = [{} for _ in range(0, total)]
for i, member in enumerate(members):
    member['name'] = fake.name()
    member['books'] = rentals[i]
    member['id'] = "member_" + str(i + 1)
for i, book in enumerate(books):
    book['title'] = " ".join(fake.words(np.random.randint(1,6))).title()
    book['id'] = "book_" + str(i + 1)
events = []
for member in members:
    for _ in range(0, member['books']):
        events.append([member['id'], np.random.choice(books, 1, p=book_ps)[0]['id']])
book_links = []
for book in books:
    members_who_borrowed = set([event[0] for event in events if event[1] == book['id']])
    books_in_common = set([event[1] for event in events if event[0] in members_who_borrowed])
    for other_book in books_in_common:
        if(book['id'] != other_book):
            this_link = next((link for link in book_links if (link["source"] == book['id'] and link["target"] == other_book)), None)
            if this_link == None:
                inverse_link = next((link for link in book_links if (link["target"] == book['id'] and link["source"] == other_book)), None)
                if inverse_link == None:
                    book_links.append({"source": book['id'], "target": other_book, "value": 1})
                else:
                    book_links[book_links.index(inverse_link)]["value"] += 1
            else:
                book_links[book_links.index(this_link)]["value"] += 1
