from faker import Factory
import numpy as np
import json

fake = Factory.create()
total = 30 
average = 10
shape = 2 # this is the weibull shape. The larger it is, the narrower the distribution will be around 1. 
rentals = [int(average * x) for x in np.random.weibull(shape, total)]
book_probs = [int(average * x) for x in np.random.weibull(shape, total)]
book_ps = [probability / sum(book_probs) for probability in book_probs]
members = [{} for _ in range(0, total)]
books = [{} for _ in range(0, total)]
for i, member in enumerate(members):
    member['name'] = fake.name()
    member['books'] = rentals[i]
    member['edges'] = []
    member["id"] = "member_" + str(i + 1)
for i, book in enumerate(books):
    book['title'] = " ".join(fake.words(np.random.randint(1,6))).title()
    book["id"] = "book_" + str(i + 1)
    book['edges'] = []
events = []
for member in members:
    for _ in range(0, member['books']):
        events.append([member["id"], np.random.choice(books, 1, p=book_ps)[0]["id"]])
book_links = []
for book in books:
    members_who_borrowed = set([event[0] for event in events if event[1] == book["id"]])
    books_in_common = set([event[1] for event in events if event[0] in members_who_borrowed])
    for other_book in books_in_common:
        if(book["id"] != other_book):
            this_link = next((link for link in book_links if (link["source"] == book["id"] and link["target"] == other_book)), None)
            if this_link == None:
                inverse_link = next((link for link in book_links if (link["target"] == book["id"] and link["source"] == other_book)), None)
                if inverse_link == None:
                    members_who_borrowed_other_book = set([event[0] for event in events if event[1] == other_book])
                    common_members = [member for member in members_who_borrowed if member in members_who_borrowed_other_book]
                    id = book["id"] + "_" + other_book
                    for member in common_members:
                        this_member = next(mem for mem in members if mem["id"] == member)
                        members[members.index(this_member)]["edges"].append(id)
                    book_links.append({"id": id, "source": book["id"], "target": other_book, "nodes": common_members, "value": len(common_members)})
member_links = []
for member in members:
    borrowed_books = set([event[1] for event in events if event[0] == member["id"]])
    members_in_common = set([event[0] for event in events if event[1] in borrowed_books])
    for other_member in members_in_common:
        if(member["id"] != other_member):
            this_link = next((link for link in member_links if (link["source"] == member["id"] and link["target"] == other_member)), None)
            if this_link == None:
                inverse_link = next((link for link in member_links if (link["target"] == member["id"] and link["source"] == other_member)), None)
                if inverse_link == None:
                    books_borrowed_other_member = set([event[1] for event in events if event[0] == other_member])
                    common_books = [book for book in borrowed_books if book in books_borrowed_other_member]
                    id = member["id"] + "_" + other_member
                    for book in common_books:
                        this_book = next(boo for boo in books if boo["id"] == book)
                        books[books.index(this_book)]["edges"].append(id)
                    member_links.append({"id": id, "source": member["id"], "target": other_member, "value": len(common_books), "nodes": common_books})
with open("books.json", "w") as outfile:
    json.dump(books, outfile)
with open("book_links.json", "w") as outfile:
    json.dump(book_links, outfile)
with open("members.json", "w") as outfile:
    json.dump(members, outfile)
with open("member_links.json", "w") as outfile:
    json.dump(member_links, outfile)
