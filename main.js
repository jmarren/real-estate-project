const axios = require("axios");
const cheerio = require("cheerio");
const readline = require("readline");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Please enter the target URL: ", (URL) => {
  const csvWriter = createCsvWriter({
    path: "output.csv",
    header: [
      { id: "bedrooms", title: "Bedrooms" },
      { id: "bathrooms", title: "Bathrooms" },
      { id: "rent", title: "Rent" },
      { id: "sqft", title: "Square Footage" },
      { id: "style", title: "Style" },
      { id: "availability", title: "Availability" },
    ],
  });

  axios
    .get(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })
    .then((response) => {
      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const records = [];

        $(".unitContainer").each((index, unitContainer) => {
          const record = {
            bedrooms: $(unitContainer)
              .find('span[data-qaid="beds"]')
              .text()
              .trim(),
            bathrooms: $(unitContainer)
              .find('span[data-qaid="baths"]')
              .text()
              .trim(),
            rent: $(unitContainer).find('span[data-qaid="rent"]').text().trim(),
            sqft: $(unitContainer)
              .find('span[data-qaid="sq-ft"]')
              .text()
              .trim(),
            style: $(unitContainer)
              .find('span[data-qaid="style"]')
              .text()
              .trim(),
            availability: $(unitContainer)
              .find('span[data-qaid="availability"]')
              .text()
              .trim(),
          };
          records.push(record);
        });

        return csvWriter.writeRecords(records);
      } else {
        console.log(
          `Failed to retrieve the page. Status code: ${response.status}`
        );
      }
    })
    .then(() => {
      console.log("Data has been written to output.csv");
      rl.close();
    })
    .catch((error) => {
      console.error("Error:", error.message);
      rl.close();
    });
});
