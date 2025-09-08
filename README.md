# Travel History Visualiser

**Travel History Visualiser** is a web-based tool for analysing and visualising personal travel records. It accepts CSV-style input of visit periods and outputs aggregated stay durations per region, shown as either a chart or table.

The tool is designed to handle nuanced rules around how travel days are counted. This includes configurable inclusion of entry and exit days, partial-day weighting, and the correct handling of overlapping or adjacent spans. These rules are essential in contexts like stay limit compliance and tax residency determination.

## Features

Users can input travel history in a CSV-like format, then choose how to interpret stay durations based on various counting methods. Data can be displayed as a pie chart or table, sorted and broken down by region or individual trip.

Flags, language localisation, and UI themes enhance readability, but the primary focus is correctness and flexibility in stay duration calculation.

## Use Cases

This tool is useful for frequent travellers who need to:

* Track time spent in different regions for legal, administrative, or personal purposes
* Check compliance with rules limiting time spent abroad or in a specific location
* Calculate residence days for **tax reporting**, especially for determining tax residency status

All calculations are done locally in the browser. No data is stored or transmitted.

## Q\&A

**What makes this tool different?**

It focuses on the **precise counting of days**, which varies by jurisdiction. Users can configure how start and end dates are interpreted, which is essential for accurate reporting.

**Can it be used for official purposes?**

It can assist in preparation, but users should verify results against official requirements.

**Is my data safe?**

Yes. Everything runs client-side. No travel records leave your device.

**Where can I use it?**

The tool is available at **[ayaka14732.github.io/travel-history-visualiser](https://ayaka14732.github.io/travel-history-visualiser)**. It is open source and maintained on GitHub.
