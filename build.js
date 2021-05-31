const fs = require('fs');
const path = require('path');

const template = (body, is_home = false, additional_header = '') => `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom search engines</title>
    <link rel="stylesheet" href="/style.css">
    ${additional_header}
</head>
<body>
    <a href="https://github.com/baltpeter/custom-search-engines"><img style="position: absolute; top: 0; right: 0; border: 0;" src="/forkme.png" alt="Fork me on GitHub"></a>
    ${body}
    <footer>
        ${is_home ? '' : '<a href="/">🢐 back</a>'}
        <span style="float: right;"><a href="https://benjamin-altpeter.de/privacy">Privacy policy</a> · <a href="https://benjamin-altpeter.de/contact">Legal notice</a></span>
    </footer>
</body>
</html>`;
const index_template = (rows) =>
    template(
        `<h1>My custom search engines</h1>

<p>
    I like to use custom search engines. Firefox unfortunately does not have an interface to add them. In fact, they <a href="https://www.fxsitecompat.dev/en-CA/docs/2020/window-external-addsearchprovider-is-now-a-dummy-function/">recently even dropped</a> the API for programmatically adding them.<br>
    The suggested workaround is to <a href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_settings_overrides">create an addon</a> that adds your custom search engines. Unfortunately, one addon can only add a single search engine. That doesn't exactly scale well.
</p>
<p>This leaves <a href="https://developer.mozilla.org/en-US/docs/Web/OpenSearch">OpenSearch descriptions</a> as the only sort-of viable method. So, here are my custom search engines as OpenSearch descriptions.</p>
<p><strong>Note</strong>: These search engines probably aren't useful for you. Feel free to try them, though.</p>

<h2>The search engines</h2>
<ul>
    ${rows}
</ul>`,
        true
    );
const engine_html_template = (e) =>
    template(
        `<h1>${e.name}</h1>

<p>
    This engine uses the following search URL:<br>
    <code>${e.url}</code>
</p>
<p>
    To add it, you <strong>need</strong> to enable the separate search bar in Firefox. It will then offer an option <em>Add “${e.name}”</em>.<br>
    <img style="display: block; margin: auto; margin-top: 10px;" src="/firefox-add-custom-search-engine.png">
</p>
`,
        false,
        `<link rel="search" type="application/opensearchdescription+xml" title="${e.name}" href="/engine/opensearch/${e.slug}.xml">`
    );
const engine_xml_template = (
    e
) => `<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
    <ShortName>${e.name}</ShortName>
    <Description>${e.name}</Description>
    <Url type="text/html" method="get" template="${e.url.replace(/&/g, '&amp;')}"/>
    <InputEncoding>UTF-8</InputEncoding>
    <Image height="64" width="64" type="image/x-icon">${e.icon}</Image>
</OpenSearchDescription>`;

const engines = require('./engines.json');

for (const e of engines) {
    fs.writeFileSync(path.join(__dirname, 'public', 'engine', e.slug + '.html'), engine_html_template(e));
    fs.writeFileSync(path.join(__dirname, 'public', 'engine', 'opensearch', e.slug + '.xml'), engine_xml_template(e));
}

const rows = engines
    .map((e) => `<li><a href="/engine/${e.slug}.html"><img class="engine-icon" src="${e.icon}">${e.name}</a></li>`)
    .join('\n');
fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), index_template(rows));
