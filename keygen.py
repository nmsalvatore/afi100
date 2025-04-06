#!/usr/bin/env python3

import json
import random


def generate_key():
    with open("data/word_list.json") as f:
        word_list = json.load(f)

    words = random.sample(word_list, k=3)
    random_word = random.choice(words)
    random_word_index = words.index(random_word)
    words[random_word_index] = random_word + str(random.randint(10, 99))
    return "-".join(words)
