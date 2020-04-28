var Horseman = require('node-horseman');
var horseman = new Horseman();
var fs = require('fs')
var finalData = [];

var url = 'https://busca.magazineluiza.com.br/busca?q=';
var types_products = ['celular', 'notebook', 'geladeira', 'mesas'];

var product = Math.floor(Math.random() * types_products.length);

url = url+types_products[product];
console.log(types_products[product]);

function getdata() {
    return horseman.evaluate(function() {
        var descNode = document.querySelectorAll('.nm-product-name');
        var desc = Array.prototype.map.call(descNode, function (t) { return t.textContent.trim() })
        var finalData = [];

        for(var i = 0; i < desc.length; i++) {
            var item = {}
            item['descricao'] = desc[i]
            item['imageURL'] = document.querySelectorAll('.nm-product-img')[i].getAttribute('src');
            finalData.push(item)
        }
        return finalData
    });
}

function hasNextPage() {
    return horseman.exists('.neemu-pagination-next');
}

function scraping() {
    return new Promise(function(resolve, reject) {
        return getdata()
        .then(function(newData) {
            finalData = finalData.concat(newData)
            console.log(`${finalData.length} itens de ${finalData.length / 60} páginas`)

            
            if(finalData.length >= 800) {
                horseman.close();
            } else {
                return hasNextPage()
                .then(function(hasNext) {
                    if(hasNext) {
                        return horseman
                            .click('.neemu-pagination-next')
                            .wait(1000)
                            .then(scraping)
                    }
                });
            }
        })
        .then(resolve)
    })
}

horseman
    .on('consoleMessage', function(msg) {
        console.log(msg)
    })
    .open(url)
    .then(scraping)
    .finally(function() {
        fs.writeFile('produtos.json', JSON.stringify(finalData, null, 4),{ enconding:'utf-8', flag: 'a' }, function (err) {
            if (err) throw err;
            else console.log('Produtos salvos com sucesso!')
            finalData = [];
        });
    })