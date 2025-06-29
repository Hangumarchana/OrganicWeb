const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');


let template, main, parsedData , details;

const replaceTemplate = (template, item) => {
    let output = template.replace(/{%PROName%}/g, item.productName);
    output = output.replace(/{%PRODUCTPRICE%}/g, item.price);
    output = output.replace(/{%PRODUCTIMAGE%}/g, item.image);
    output = output.replace(/{%PRODUCTDESCRIPTION%}/g, item.description);
    output = output.replace(/{%QUANTITY%}/g, item.quantity);
    output = output.replace(/{%ID%}/g, item.id);
    output = output.replace(/{%ORIGIN%}/g, item.from); // Note: Corrected {%ORGIN%} to {%ORIGIN%}
    output = output.replace(/{%STATUS%}/g, item.status === 'true' ? 'Organic' : 'Non-Organic');
    output = output.replace(/{%NUTRIENTS%}/g, item.nutrients);
    return output;
};


try {
    template = fs.readFileSync('template.html', 'utf8');
    main = fs.readFileSync('index.html', 'utf8');
    details=fs.readFileSync('productDetails.html', 'utf8');

    const data = fs.readFileSync('data.json', 'utf8');
    parsedData = JSON.parse(data);
} catch (error) {
    console.error('Error reading files:', error.message);
    process.exit(1);
}


const server = http.createServer((req, res) => {

    const {query,pathname} = url.parse(req.url, true);
    const pathName = req.url;

    if (pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });


        const templateData = parsedData.map(item => replaceTemplate(template, item));
        const finalOutput = main.replace('{%DATA%}', templateData.join(''));

        res.end(finalOutput);
    }
    else if (pathname ==='/product'){
        console.log(query);
        const product = parsedData[query.id];
        console.log(product);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        const output = replaceTemplate(details, product);
        res.end(output);
    }

    else {

        const filePath = path.join(__dirname, pathname);
        const ext = path.extname(filePath);

        const contentTypeMap = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.avif': 'image/avif',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
            '.ico': 'image/x-icon',
            '.webp': 'image/webp'
        };

        const contentType = contentTypeMap[ext] || 'text/plain';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    }
});

server.listen(8000, '127.0.0.1', () =>
    console.log('Server is running on port 8000')
);
