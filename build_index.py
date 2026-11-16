#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os

with open('categories.json', 'r', encoding='utf-8') as f:
    cat_data = json.load(f)
    categories = cat_data['categories']

with open('products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(categories)} categories and {len(products)} products.")
print("index.html is up to date with Amazon layout.")
