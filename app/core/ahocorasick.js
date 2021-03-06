'use strict';
const _ = require('lodash');
const ahocorasick = require('aho-corasick.js');
const trie = new ahocorasick.TrieNode();

module.exports = async app => {
    const list =
        app.config.self.env === 'unittest'
            ? []
            : await app.model.sensitiveWords.findAll({ limit: 100000 });
    _.each(list, o => o.word && trie.add(o.word, { word: o.word.trim() }));
    ahocorasick.add_suffix_links(trie);

    ahocorasick.check = async word => {
        const data = await new Promise(resolve => {
            const words = [];
            ahocorasick.search(word, trie, foundWord => {
                words.push(foundWord);
            });
            return resolve(words);
        });

        return data;
    };

    app.ahocorasick = ahocorasick;
};
