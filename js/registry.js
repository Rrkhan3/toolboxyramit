/* Central tool registry: the single source for search, categories, counts, popular tools and cards. */
window.CATEGORIES = [
 {
  "name": "Calculators",
  "slug": "calculators",
  "icon": "🧮",
  "description": "Percentages, dates, loans, health and everyday math."
 },
 {
  "name": "Text Tools",
  "slug": "text-tools",
  "icon": "📝",
  "description": "Count, clean, sort and transform text in one click."
 },
 {
  "name": "Image Tools",
  "slug": "image-tools",
  "icon": "🖼️",
  "description": "Resize, compress, crop and convert images in your browser."
 },
 {
  "name": "Developer Tools",
  "slug": "developer-tools",
  "icon": "💻",
  "description": "Format, validate, encode and generate developer data."
 },
 {
  "name": "Converters",
  "slug": "converters",
  "icon": "🔄",
  "description": "Convert length, weight, temperature, data and more."
 },
 {
  "name": "Generators",
  "slug": "generators",
  "icon": "▦",
  "description": "Create QR codes, passwords, barcodes and other generated content."
 },
 {
  "name": "PDF Tools",
  "slug": "pdf-tools",
  "icon": "📄",
  "description": "Merge, split and work with PDF files in your browser."
 }
];
window.TOOLS = [
 {
  "name": "Age Calculator",
  "slug": "age-calculator",
  "category": "Calculators",
  "description": "Calculate your exact age",
  "keywords": [
   "age",
   "birthday",
   "date",
   "years",
   "months",
   "days"
  ],
  "popular": true,
  "id": "age-calculator",
  "icon": "🧮",
  "url": "tools/age-calculator"
 },
 {
  "name": "Percentage Calculator",
  "slug": "percentage-calculator",
  "category": "Calculators",
  "description": "Find percentages and percent change",
  "keywords": [
   "percent",
   "percentage",
   "ratio",
   "change",
   "increase",
   "decrease"
  ],
  "popular": true,
  "id": "percentage-calculator",
  "icon": "🧮",
  "url": "tools/percentage-calculator"
 },
 {
  "name": "Discount Calculator",
  "slug": "discount-calculator",
  "category": "Calculators",
  "description": "Calculate the sale price after a discount",
  "keywords": [
   "discount",
   "sale",
   "price",
   "offer",
   "savings"
  ],
  "popular": false,
  "id": "discount-calculator",
  "icon": "🧮",
  "url": "tools/discount-calculator"
 },
 {
  "name": "BMI Calculator",
  "slug": "bmi-calculator",
  "category": "Calculators",
  "description": "Check your body mass index",
  "keywords": [
   "bmi",
   "weight",
   "height",
   "health",
   "body",
   "mass"
  ],
  "popular": false,
  "id": "bmi-calculator",
  "icon": "🧮",
  "url": "tools/bmi-calculator"
 },
 {
  "name": "EMI Calculator",
  "slug": "emi-calculator",
  "category": "Calculators",
  "description": "Calculate monthly loan EMI",
  "keywords": [
   "emi",
   "loan",
   "mortgage",
   "installment",
   "interest"
  ],
  "popular": false,
  "id": "emi-calculator",
  "icon": "🧮",
  "url": "tools/emi-calculator"
 },
 {
  "name": "Simple Interest Calculator",
  "slug": "simple-interest-calculator",
  "category": "Calculators",
  "description": "Calculate simple interest",
  "keywords": [
   "simple",
   "interest",
   "principal",
   "rate"
  ],
  "popular": false,
  "id": "simple-interest-calculator",
  "icon": "🧮",
  "url": "tools/simple-interest-calculator"
 },
 {
  "name": "Compound Interest Calculator",
  "slug": "compound-interest-calculator",
  "category": "Calculators",
  "description": "Calculate compound interest growth",
  "keywords": [
   "compound",
   "interest",
   "growth",
   "savings",
   "investment"
  ],
  "popular": false,
  "id": "compound-interest-calculator",
  "icon": "🧮",
  "url": "tools/compound-interest-calculator"
 },
 {
  "name": "Date Difference Calculator",
  "slug": "date-difference",
  "category": "Calculators",
  "description": "Find the days between two dates",
  "keywords": [
   "date",
   "difference",
   "days",
   "between",
   "weeks",
   "calendar"
  ],
  "popular": false,
  "id": "date-difference",
  "icon": "🧮",
  "url": "tools/date-difference"
 },
 {
  "name": "Average Calculator",
  "slug": "average-calculator",
  "category": "Calculators",
  "description": "Calculate mean, median and more",
  "keywords": [
   "average",
   "mean",
   "median",
   "numbers",
   "sum"
  ],
  "popular": false,
  "id": "average-calculator",
  "icon": "🧮",
  "url": "tools/average-calculator"
 },
 {
  "name": "Time Calculator",
  "slug": "time-calculator",
  "category": "Calculators",
  "description": "Add or subtract hours and minutes",
  "keywords": [
   "time",
   "add",
   "subtract",
   "hours",
   "minutes",
   "duration"
  ],
  "popular": false,
  "id": "time-calculator",
  "icon": "🧮",
  "url": "tools/time-calculator"
 },
 {
  "name": "Word Counter",
  "slug": "word-counter",
  "category": "Text Tools",
  "description": "Count words and characters online",
  "keywords": [
   "word",
   "count",
   "characters",
   "sentences",
   "paragraphs",
   "reading",
   "time"
  ],
  "popular": true,
  "id": "word-counter",
  "icon": "📝",
  "url": "tools/word-counter"
 },
 {
  "name": "Character Counter",
  "slug": "character-counter",
  "category": "Text Tools",
  "description": "Count characters, lines and bytes",
  "keywords": [
   "character",
   "count",
   "length",
   "bytes",
   "letters"
  ],
  "popular": false,
  "id": "character-counter",
  "icon": "📝",
  "url": "tools/character-counter"
 },
 {
  "name": "Case Converter",
  "slug": "case-converter",
  "category": "Text Tools",
  "description": "Change text case instantly",
  "keywords": [
   "case",
   "upper",
   "lower",
   "title",
   "sentence",
   "camel",
   "snake",
   "kebab"
  ],
  "popular": false,
  "id": "case-converter",
  "icon": "📝",
  "url": "tools/case-converter"
 },
 {
  "name": "Text Reverser",
  "slug": "text-reverser",
  "category": "Text Tools",
  "description": "Reverse text, words or lines",
  "keywords": [
   "reverse",
   "text",
   "flip",
   "backwards"
  ],
  "popular": false,
  "id": "text-reverser",
  "icon": "📝",
  "url": "tools/text-reverser"
 },
 {
  "name": "Remove Duplicate Lines",
  "slug": "remove-duplicate-lines",
  "category": "Text Tools",
  "description": "Remove duplicate lines from text",
  "keywords": [
   "duplicate",
   "lines",
   "unique",
   "dedupe",
   "remove",
   "repeated"
  ],
  "popular": false,
  "id": "remove-duplicate-lines",
  "icon": "📝",
  "url": "tools/remove-duplicate-lines"
 },
 {
  "name": "Text Sorter",
  "slug": "text-sorter",
  "category": "Text Tools",
  "description": "Sort lines alphabetically or numerically",
  "keywords": [
   "sort",
   "lines",
   "alphabetical",
   "numeric",
   "order"
  ],
  "popular": false,
  "id": "text-sorter",
  "icon": "📝",
  "url": "tools/text-sorter"
 },
 {
  "name": "Slug Generator",
  "slug": "slug-generator",
  "category": "Text Tools",
  "description": "Create clean URL slugs",
  "keywords": [
   "slug",
   "url",
   "permalink",
   "seo",
   "friendly"
  ],
  "popular": false,
  "id": "slug-generator",
  "icon": "📝",
  "url": "tools/slug-generator"
 },
 {
  "name": "Text Cleaner",
  "slug": "text-cleaner",
  "category": "Text Tools",
  "description": "Clean up messy text",
  "keywords": [
   "clean",
   "text",
   "whitespace",
   "spaces",
   "blank",
   "lines",
   "html"
  ],
  "popular": false,
  "id": "text-cleaner",
  "icon": "📝",
  "url": "tools/text-cleaner"
 },
 {
  "name": "JSON Formatter",
  "slug": "json-formatter",
  "category": "Developer Tools",
  "description": "Format and beautify JSON online",
  "keywords": [
   "json",
   "format",
   "beautify",
   "pretty",
   "print",
   "minify"
  ],
  "popular": true,
  "id": "json-formatter",
  "icon": "💻",
  "url": "tools/json-formatter"
 },
 {
  "name": "JSON Validator",
  "slug": "json-validator",
  "category": "Developer Tools",
  "description": "Check if JSON is valid",
  "keywords": [
   "json",
   "validate",
   "valid",
   "syntax",
   "check"
  ],
  "popular": false,
  "id": "json-validator",
  "icon": "💻",
  "url": "tools/json-validator"
 },
 {
  "name": "Base64 Encoder",
  "slug": "base64-encoder",
  "category": "Developer Tools",
  "description": "Encode text to Base64",
  "keywords": [
   "base64",
   "encode",
   "text"
  ],
  "popular": false,
  "id": "base64-encoder",
  "icon": "💻",
  "url": "tools/base64-encoder"
 },
 {
  "name": "Base64 Decoder",
  "slug": "base64-decoder",
  "category": "Developer Tools",
  "description": "Decode Base64 to text",
  "keywords": [
   "base64",
   "decode",
   "text"
  ],
  "popular": false,
  "id": "base64-decoder",
  "icon": "💻",
  "url": "tools/base64-decoder"
 },
 {
  "name": "URL Encoder",
  "slug": "url-encoder",
  "category": "Developer Tools",
  "description": "Percent-encode URLs and text",
  "keywords": [
   "url",
   "encode",
   "percent",
   "encoding",
   "query",
   "string"
  ],
  "popular": false,
  "id": "url-encoder",
  "icon": "💻",
  "url": "tools/url-encoder"
 },
 {
  "name": "URL Decoder",
  "slug": "url-decoder",
  "category": "Developer Tools",
  "description": "Decode percent-encoded URLs",
  "keywords": [
   "url",
   "decode",
   "percent",
   "encoding",
   "query",
   "string"
  ],
  "popular": false,
  "id": "url-decoder",
  "icon": "💻",
  "url": "tools/url-decoder"
 },
 {
  "name": "UUID Generator",
  "slug": "uuid-generator",
  "category": "Developer Tools",
  "description": "Generate random UUID v4 values",
  "keywords": [
   "uuid",
   "guid",
   "unique",
   "id",
   "random",
   "generator"
  ],
  "popular": false,
  "id": "uuid-generator",
  "icon": "💻",
  "url": "tools/uuid-generator"
 },
 {
  "name": "HTML Formatter",
  "slug": "html-formatter",
  "category": "Developer Tools",
  "description": "Format and preview HTML",
  "keywords": [
   "html",
   "format",
   "beautify",
   "indent",
   "pretty"
  ],
  "popular": false,
  "id": "html-formatter",
  "icon": "💻",
  "url": "tools/html-formatter"
 },
 {
  "name": "CSS Formatter",
  "slug": "css-formatter",
  "category": "Developer Tools",
  "description": "Format and preview CSS",
  "keywords": [
   "css",
   "format",
   "beautify",
   "indent",
   "stylesheet"
  ],
  "popular": false,
  "id": "css-formatter",
  "icon": "💻",
  "url": "tools/css-formatter"
 },
 {
  "name": "JavaScript Formatter",
  "slug": "js-formatter",
  "category": "Developer Tools",
  "description": "Format and preview JavaScript",
  "keywords": [
   "javascript",
   "js",
   "format",
   "beautify",
   "indent",
   "preview",
   "console"
  ],
  "popular": false,
  "id": "js-formatter",
  "icon": "💻",
  "url": "tools/js-formatter"
 },
 {
  "name": "Image Resizer",
  "slug": "image-resizer",
  "category": "Image Tools",
  "description": "Resize images to any size",
  "keywords": [
   "image",
   "resize",
   "dimensions",
   "width",
   "height",
   "photo"
  ],
  "popular": true,
  "id": "image-resizer",
  "icon": "🖼️",
  "url": "tools/image-resizer"
 },
 {
  "name": "Image Compressor",
  "slug": "image-compressor",
  "category": "Image Tools",
  "description": "Compress JPG and WebP images",
  "keywords": [
   "image",
   "compress",
   "reduce",
   "file",
   "size",
   "optimize",
   "photo"
  ],
  "popular": true,
  "id": "image-compressor",
  "icon": "🖼️",
  "url": "tools/image-compressor"
 },
 {
  "name": "Image Cropper",
  "slug": "image-cropper",
  "category": "Image Tools",
  "description": "Crop images to exact pixels",
  "keywords": [
   "image",
   "crop",
   "cut",
   "trim",
   "photo"
  ],
  "popular": false,
  "id": "image-cropper",
  "icon": "🖼️",
  "url": "tools/image-cropper"
 },
 {
  "name": "JPG to PNG Converter",
  "slug": "jpg-to-png",
  "category": "Image Tools",
  "description": "Convert JPG images to PNG",
  "keywords": [
   "jpg",
   "jpeg",
   "png",
   "convert",
   "image"
  ],
  "popular": false,
  "id": "jpg-to-png",
  "icon": "🖼️",
  "url": "tools/jpg-to-png"
 },
 {
  "name": "PNG to JPG Converter",
  "slug": "png-to-jpg",
  "category": "Image Tools",
  "description": "Convert PNG images to JPG",
  "keywords": [
   "png",
   "jpg",
   "jpeg",
   "convert",
   "image"
  ],
  "popular": false,
  "id": "png-to-jpg",
  "icon": "🖼️",
  "url": "tools/png-to-jpg"
 },
 {
  "name": "Image to Base64 Converter",
  "slug": "image-to-base64",
  "category": "Image Tools",
  "description": "Convert an image to a Base64 data URL",
  "keywords": [
   "image",
   "base64",
   "data",
   "url",
   "encode"
  ],
  "popular": false,
  "id": "image-to-base64",
  "icon": "🖼️",
  "url": "tools/image-to-base64"
 },
 {
  "name": "Length Converter",
  "slug": "length-converter",
  "category": "Converters",
  "description": "Convert between length units",
  "keywords": [
   "length",
   "convert",
   "meter",
   "feet",
   "inch",
   "mile",
   "km"
  ],
  "popular": false,
  "id": "length-converter",
  "icon": "🔄",
  "url": "tools/length-converter"
 },
 {
  "name": "Weight Converter",
  "slug": "weight-converter",
  "category": "Converters",
  "description": "Convert between weight units",
  "keywords": [
   "weight",
   "mass",
   "convert",
   "kg",
   "pound",
   "ounce",
   "gram"
  ],
  "popular": false,
  "id": "weight-converter",
  "icon": "🔄",
  "url": "tools/weight-converter"
 },
 {
  "name": "Temperature Converter",
  "slug": "temperature-converter",
  "category": "Converters",
  "description": "Convert Celsius, Fahrenheit and Kelvin",
  "keywords": [
   "temperature",
   "convert",
   "celsius",
   "fahrenheit",
   "kelvin"
  ],
  "popular": false,
  "id": "temperature-converter",
  "icon": "🔄",
  "url": "tools/temperature-converter"
 },
 {
  "name": "Area Converter",
  "slug": "area-converter",
  "category": "Converters",
  "description": "Convert between area units",
  "keywords": [
   "area",
   "convert",
   "square",
   "meter",
   "acre",
   "hectare",
   "feet"
  ],
  "popular": false,
  "id": "area-converter",
  "icon": "🔄",
  "url": "tools/area-converter"
 },
 {
  "name": "Volume Converter",
  "slug": "volume-converter",
  "category": "Converters",
  "description": "Convert between volume units",
  "keywords": [
   "volume",
   "convert",
   "liter",
   "gallon",
   "cup",
   "ml"
  ],
  "popular": false,
  "id": "volume-converter",
  "icon": "🔄",
  "url": "tools/volume-converter"
 },
 {
  "name": "Speed Converter",
  "slug": "speed-converter",
  "category": "Converters",
  "description": "Convert between speed units",
  "keywords": [
   "speed",
   "convert",
   "kmh",
   "mph",
   "knot",
   "velocity"
  ],
  "popular": false,
  "id": "speed-converter",
  "icon": "🔄",
  "url": "tools/speed-converter"
 },
 {
  "name": "Time Converter",
  "slug": "time-converter",
  "category": "Converters",
  "description": "Convert between time units",
  "keywords": [
   "time",
   "convert",
   "seconds",
   "minutes",
   "hours",
   "days",
   "weeks"
  ],
  "popular": false,
  "id": "time-converter",
  "icon": "🔄",
  "url": "tools/time-converter"
 },
 {
  "name": "Data Storage Converter",
  "slug": "data-storage-converter",
  "category": "Converters",
  "description": "Convert bits, bytes, MB, GB and TB",
  "keywords": [
   "data",
   "storage",
   "convert",
   "byte",
   "kb",
   "mb",
   "gb",
   "tb",
   "bit"
  ],
  "popular": false,
  "id": "data-storage-converter",
  "icon": "🔄",
  "url": "tools/data-storage-converter"
 },
 {
  "name": "QR Generator",
  "slug": "qr-generator",
  "category": "Generators",
  "description": "Create free QR codes for text, URLs, contacts and more",
  "keywords": [
   "qr",
   "code",
   "generator",
   "text",
   "url",
   "email",
   "phone",
   "sms",
   "wifi",
   "vcard",
   "contact",
   "image"
  ],
  "popular": true,
  "id": "qr-generator",
  "icon": "▦",
  "url": "tools/qr-generator"
 },
 {
  "name": "PDF Merger",
  "slug": "pdf-merger",
  "category": "PDF Tools",
  "description": "Merge multiple PDF files into one",
  "keywords": [
   "merge",
   "pdf",
   "combine",
   "join",
   "pdf merger",
   "combine pdf"
  ],
  "popular": true,
  "id": "pdf-merger",
  "icon": "📄",
  "url": "tools/pdf-merger"
 },
 {
  "name": "PDF Splitter",
  "slug": "pdf-splitter",
  "category": "PDF Tools",
  "description": "Split or extract PDF pages by range",
  "keywords": [
   "split",
   "pdf",
   "extract",
   "pages",
   "pdf splitter",
   "separate pdf"
  ],
  "popular": false,
  "id": "pdf-splitter",
  "icon": "📄",
  "url": "tools/pdf-splitter"
 },
 {
  "name": "Password Generator",
  "slug": "password-generator",
  "category": "Generators",
  "description": "Generate strong random passwords",
  "keywords": [
   "password",
   "generator",
   "strong",
   "secure",
   "random",
   "passphrase"
  ],
  "popular": true,
  "id": "password-generator",
  "icon": "▦",
  "url": "tools/password-generator"
 },
 {
  "name": "Random Number Generator",
  "slug": "random-number-generator",
  "category": "Generators",
  "description": "Generate random numbers in a range",
  "keywords": [
   "random",
   "number",
   "generator",
   "dice",
   "lottery",
   "picker"
  ],
  "popular": false,
  "id": "random-number-generator",
  "icon": "▦",
  "url": "tools/random-number-generator"
 },
 {
  "name": "Lorem Ipsum Generator",
  "slug": "lorem-ipsum-generator",
  "category": "Generators",
  "description": "Generate placeholder lorem ipsum text",
  "keywords": [
   "lorem",
   "ipsum",
   "placeholder",
   "dummy",
   "text",
   "filler"
  ],
  "popular": false,
  "id": "lorem-ipsum-generator",
  "icon": "▦",
  "url": "tools/lorem-ipsum-generator"
 },
 {
  "name": "Barcode Generator",
  "slug": "barcode-generator",
  "category": "Generators",
  "description": "Create CODE128, EAN and UPC barcodes",
  "keywords": [
   "barcode",
   "generator",
   "code128",
   "ean",
   "upc",
   "code39"
  ],
  "popular": false,
  "id": "barcode-generator",
  "icon": "▦",
  "url": "tools/barcode-generator"
 },
 {
  "name": "CSV to JSON Converter",
  "slug": "csv-to-json",
  "category": "Developer Tools",
  "description": "Convert CSV data to JSON arrays",
  "keywords": [
   "csv",
   "json",
   "converter",
   "parse",
   "spreadsheet",
   "data"
  ],
  "popular": false,
  "id": "csv-to-json",
  "icon": "💻",
  "url": "tools/csv-to-json"
 },
 {
  "name": "Text to ASCII Converter",
  "slug": "text-to-ascii",
  "category": "Developer Tools",
  "description": "Convert text to ASCII codes",
  "keywords": [
   "ascii",
   "text",
   "converter",
   "decimal",
   "hex",
   "binary",
   "character code"
  ],
  "popular": false,
  "id": "text-to-ascii",
  "icon": "💻",
  "url": "tools/text-to-ascii"
 },
 {
  "name": "Color Picker & Converter",
  "slug": "color-picker",
  "category": "Developer Tools",
  "description": "Pick colors and convert HEX, RGB, HSL",
  "keywords": [
   "color",
   "picker",
   "hex",
   "rgb",
   "hsl",
   "converter",
   "css"
  ],
  "popular": false,
  "id": "color-picker",
  "icon": "💻",
  "url": "tools/color-picker"
 },
 {
  "name": "UTM URL Builder",
  "slug": "utm-builder",
  "category": "Developer Tools",
  "description": "Build campaign URLs with UTM parameters",
  "keywords": [
   "utm",
   "builder",
   "url",
   "campaign",
   "tracking",
   "analytics",
   "google"
  ],
  "popular": false,
  "id": "utm-builder",
  "icon": "💻",
  "url": "tools/utm-builder"
 },
 {
  "name": "Whitespace Remover",
  "slug": "whitespace-remover",
  "category": "Text Tools",
  "description": "Remove extra spaces and blank lines",
  "keywords": [
   "whitespace",
   "remover",
   "spaces",
   "trim",
   "clean",
   "text",
   "blank lines"
  ],
  "popular": false,
  "id": "whitespace-remover",
  "icon": "📝",
  "url": "tools/whitespace-remover"
 },
 {
  "name": "PDF to JPG Converter",
  "slug": "pdf-to-jpg",
  "category": "PDF Tools",
  "description": "Convert PDF pages to JPG images",
  "keywords": [
   "pdf to jpg",
   "convert pdf",
   "pdf image"
  ],
  "popular": true,
  "id": "pdf-to-jpg",
  "icon": "\ud83d\udcc4",
  "url": "tools/pdf-to-jpg"
 },
 {
  "name": "JPG to PDF Converter",
  "slug": "jpg-to-pdf",
  "category": "PDF Tools",
  "description": "Convert JPG images to PDF",
  "keywords": [
   "jpg to pdf",
   "images to pdf"
  ],
  "popular": true,
  "id": "jpg-to-pdf",
  "icon": "\ud83d\udcc4",
  "url": "tools/jpg-to-pdf"
 },
 {
  "name": "Image to PDF Converter",
  "slug": "image-to-pdf",
  "category": "PDF Tools",
  "description": "Convert images to PDF",
  "keywords": [
   "image to pdf",
   "png to pdf",
   "photo to pdf"
  ],
  "popular": true,
  "id": "image-to-pdf",
  "icon": "\ud83d\udcc4",
  "url": "tools/image-to-pdf"
 },
 {
  "name": "PDF Compressor",
  "slug": "pdf-compressor",
  "category": "PDF Tools",
  "description": "Reduce PDF file size",
  "keywords": [
   "compress pdf",
   "pdf compressor",
   "reduce pdf"
  ],
  "popular": true,
  "id": "pdf-compressor",
  "icon": "\ud83d\udcc4",
  "url": "tools/pdf-compressor"
 },
 {
  "name": "PDF to Text Extractor",
  "slug": "pdf-to-text",
  "category": "PDF Tools",
  "description": "Extract text from PDF",
  "keywords": [
   "pdf to text",
   "extract text",
   "pdf text"
  ],
  "popular": false,
  "id": "pdf-to-text",
  "icon": "\ud83d\udcc4",
  "url": "tools/pdf-to-text"
 },
 {
  "name": "PDF Page Extractor",
  "slug": "pdf-page-extractor",
  "category": "PDF Tools",
  "description": "Extract selected PDF pages",
  "keywords": [
   "extract pages",
   "pdf page extractor",
   "split pages"
  ],
  "popular": false,
  "id": "pdf-page-extractor",
  "icon": "\ud83d\udcc4",
  "url": "tools/pdf-page-extractor"
 },
 {
  "name": "PDF Rotate",
  "slug": "pdf-rotate",
  "category": "PDF Tools",
  "description": "Rotate PDF pages",
  "keywords": [
   "rotate pdf",
   "turn pdf pages"
  ],
  "popular": false,
  "id": "pdf-rotate",
  "icon": "\ud83d\udcc4",
  "url": "tools/pdf-rotate"
 },
 {
  "name": "PDF Page Reorder",
  "slug": "pdf-page-reorder",
  "category": "PDF Tools",
  "description": "Reorder PDF pages",
  "keywords": [
   "reorder pdf",
   "rearrange pages"
  ],
  "popular": false,
  "id": "pdf-page-reorder",
  "icon": "\ud83d\udcc4",
  "url": "tools/pdf-page-reorder"
 },
 {
  "name": "WebP to JPG Converter",
  "slug": "webp-to-jpg",
  "category": "Image Tools",
  "description": "Convert WebP to JPG",
  "keywords": [
   "webp to jpg",
   "webp converter"
  ],
  "popular": false,
  "id": "webp-to-jpg",
  "icon": "\ud83d\uddbc\ufe0f",
  "url": "tools/webp-to-jpg"
 },
 {
  "name": "JPG to WebP Converter",
  "slug": "jpg-to-webp",
  "category": "Image Tools",
  "description": "Convert JPG to WebP",
  "keywords": [
   "jpg to webp",
   "webp converter"
  ],
  "popular": false,
  "id": "jpg-to-webp",
  "icon": "\ud83d\uddbc\ufe0f",
  "url": "tools/jpg-to-webp"
 },
 {
  "name": "PNG to WebP Converter",
  "slug": "png-to-webp",
  "category": "Image Tools",
  "description": "Convert PNG to WebP",
  "keywords": [
   "png to webp",
   "transparent webp"
  ],
  "popular": false,
  "id": "png-to-webp",
  "icon": "\ud83d\uddbc\ufe0f",
  "url": "tools/png-to-webp"
 },
 {
  "name": "HEIC to JPG Converter",
  "slug": "heic-to-jpg",
  "category": "Image Tools",
  "description": "Convert HEIC photos to JPG",
  "keywords": [
   "heic to jpg",
   "iphone photo",
   "heic converter"
  ],
  "popular": true,
  "id": "heic-to-jpg",
  "icon": "\ud83d\uddbc\ufe0f",
  "url": "tools/heic-to-jpg"
 },
 {
  "name": "Image Metadata Remover",
  "slug": "image-metadata-remover",
  "category": "Image Tools",
  "description": "Strip EXIF and metadata from images",
  "keywords": [
   "remove metadata",
   "exif remover",
   "strip metadata"
  ],
  "popular": false,
  "id": "image-metadata-remover",
  "icon": "\ud83d\uddbc\ufe0f",
  "url": "tools/image-metadata-remover"
 },
 {
  "name": "Image Resolution Changer",
  "slug": "image-resolution-changer",
  "category": "Image Tools",
  "description": "Change image pixel dimensions",
  "keywords": [
   "change resolution",
   "dpi",
   "resize resolution"
  ],
  "popular": false,
  "id": "image-resolution-changer",
  "icon": "\ud83d\uddbc\ufe0f",
  "url": "tools/image-resolution-changer"
 },
 {
  "name": "JSON to CSV Converter",
  "slug": "json-to-csv",
  "category": "Developer Tools",
  "description": "Convert JSON to CSV",
  "keywords": [
   "json to csv",
   "json csv"
  ],
  "popular": true,
  "id": "json-to-csv",
  "icon": "\ud83d\udcbb",
  "url": "tools/json-to-csv"
 },
 {
  "name": "JSON to YAML Converter",
  "slug": "json-to-yaml",
  "category": "Developer Tools",
  "description": "Convert JSON to YAML",
  "keywords": [
   "json to yaml",
   "yaml"
  ],
  "popular": false,
  "id": "json-to-yaml",
  "icon": "\ud83d\udcbb",
  "url": "tools/json-to-yaml"
 },
 {
  "name": "YAML to JSON Converter",
  "slug": "yaml-to-json",
  "category": "Developer Tools",
  "description": "Convert YAML to JSON",
  "keywords": [
   "yaml to json",
   "yaml parser"
  ],
  "popular": false,
  "id": "yaml-to-json",
  "icon": "\ud83d\udcbb",
  "url": "tools/yaml-to-json"
 },
 {
  "name": "HTML to Markdown Converter",
  "slug": "html-to-markdown",
  "category": "Developer Tools",
  "description": "Convert HTML to Markdown",
  "keywords": [
   "html to markdown",
   "html to md"
  ],
  "popular": false,
  "id": "html-to-markdown",
  "icon": "\ud83d\udcbb",
  "url": "tools/html-to-markdown"
 },
 {
  "name": "Markdown to HTML Converter",
  "slug": "markdown-to-html",
  "category": "Developer Tools",
  "description": "Convert Markdown to HTML",
  "keywords": [
   "markdown to html",
   "md to html"
  ],
  "popular": true,
  "id": "markdown-to-html",
  "icon": "\ud83d\udcbb",
  "url": "tools/markdown-to-html"
 },
 {
  "name": "CSS Minifier",
  "slug": "css-minifier",
  "category": "Developer Tools",
  "description": "Minify CSS code",
  "keywords": [
   "css minifier",
   "minify css",
   "compress css"
  ],
  "popular": false,
  "id": "css-minifier",
  "icon": "\ud83d\udcbb",
  "url": "tools/css-minifier"
 },
 {
  "name": "JavaScript Minifier",
  "slug": "js-minifier",
  "category": "Developer Tools",
  "description": "Minify JavaScript code",
  "keywords": [
   "js minifier",
   "minify javascript",
   "terser"
  ],
  "popular": false,
  "id": "js-minifier",
  "icon": "\ud83d\udcbb",
  "url": "tools/js-minifier"
 },
 {
  "name": "HTML Minifier",
  "slug": "html-minifier",
  "category": "Developer Tools",
  "description": "Minify HTML code",
  "keywords": [
   "html minifier",
   "minify html",
   "compress html"
  ],
  "popular": false,
  "id": "html-minifier",
  "icon": "\ud83d\udcbb",
  "url": "tools/html-minifier"
 },
 {
  "name": "JWT Decoder",
  "slug": "jwt-decoder",
  "category": "Developer Tools",
  "description": "Decode JWT tokens",
  "keywords": [
   "jwt decoder",
   "decode jwt",
   "jwt token"
  ],
  "popular": true,
  "id": "jwt-decoder",
  "icon": "\ud83d\udcbb",
  "url": "tools/jwt-decoder"
 }
];
