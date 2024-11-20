
//  -----------------------------------------------------------------------------------------------------------
//  CPI -------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
    function getTypedDataSetUrl_CPI(years, category, metadata) {
        const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
        const categoryFilter = `Bestedingscategorieen eq '${category}'`;
        const filter = `${yearFilters} and ${categoryFilter}`;
        const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
            `?$filter=${filter}&$orderby=Perioden`; 
        return typedDataSetUrl;
    }

    function CPI_populateTable(data, tableName, modifiedVariable) {
        const tableBody = document.querySelector(`#${tableName} tbody`);
        const lastModifiedElement = document.querySelector(`#cpi_mod`);
        tableBody.innerHTML = '';
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last update: ${formatDate(modifiedVariable)}`;
        }

        data.forEach(item => {
            const row = document.createElement("tr");
            const periodCell = document.createElement("td");
            periodCell.textContent = item.Perioden;
            row.appendChild(periodCell);
            const cpiCell = document.createElement("td");
            cpiCell.textContent = item.CPI_1;
            row.appendChild(cpiCell);
            const maandmutatieCell = document.createElement("td");
            maandmutatieCell.textContent = item.MaandmutatieCPI_3;
            row.appendChild(maandmutatieCell);
            const jaarmutatieCell = document.createElement("td");
            jaarmutatieCell.textContent = item.JaarmutatieCPI_5;
            row.appendChild(jaarmutatieCell);
            tableBody.appendChild(row);
        });
    }

    function createCPIChart(data) {
        const labels = data.map(item => item.Perioden);
        const yearMutationData = data.map(item => parseFloat(item.JaarmutatieCPI_5));
        const ctx = document.getElementById('cpiChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {labels: labels,
                datasets: [{
                    label: 'Year Mutation (%)',data: yearMutationData,fill: false,
                    borderColor: 'rgb(75, 192, 192)',tension: 0.1,
                    pointRadius: 1, pointHoverRadius: 5,
                }]
            },
            options: {responsive: true,
                plugins: {legend: { display: false }},
                scales: {
                    x: {title: {display: false, text: 'Period'}, 
                        ticks: { maxTicksLimit: 6, autoSkip: true, }  
                    },
                    y: {title: {display: true, text: 'Year Mutation in (%)'}}
                }
            }
        });
    }

    export async function fetchTypedDataSet(years, category, html_table, metaTable) {
        const typedDataSetUrl = getTypedDataSetUrl_CPI(years, category, metaTable);
        const tableInfosUrl = metaTable.value.find(entity => entity.name === 'TableInfos').url;

        try {const [typedDataResponse, tableInfosResponse] = await Promise.all([
                fetch(typedDataSetUrl, { method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}),
                fetch(tableInfosUrl, {method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}})
            ]);

            // if (!typedDataResponse.ok) {
            //     throw new Error(`HTTP error fetching data! status: ${typedDataResponse.status}`);
            // }
            // if (!tableInfosResponse.ok) {
            //     throw new Error(`HTTP error fetching TableInfos data! status: ${tableInfosResponse.status}`);
            // }
            if (!typedDataResponse.ok || !tableInfosResponse.ok) throw new Error('HTTP error fetching data');

            const typedData = await typedDataResponse.json();
            const tableInfosData = await tableInfosResponse.json();

            const modifiedDate = tableInfosData.value.length > 0 ? tableInfosData.value[0].Modified : 'Not Available';

            const filteredData = typedData.value.filter(item => !item.Perioden.endsWith('00'))
                .reverse()
                .slice(0, 12)
                .map(item => {
                    item.Perioden = item.Perioden.replace(/MM/, '_');  
                    return item;
                });

            CPI_populateTable(filteredData, html_table, modifiedDate);
            createCPIChart(filteredData.reverse());
            
        } catch (error) {
            console.error('Error fetching TypedDataSet or TableInfos:', error);
        }
    };


//  -----------------------------------------------------------------------------------------------------------
//  Consumer sentiment -------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
    function getTypedDataSetUrl_ConSent(years, metadata) {
        const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
        const filter = `${yearFilters}`;
        const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
            `?$filter=${filter}&$orderby=Perioden`;
        return typedDataSetUrl;
    }

    function ConSent_populateTable(data, tableName, modifiedVariable) {
        const tableBody = document.querySelector(`#${tableName} tbody`);
        const lastModifiedElement = document.querySelector(`#con_sent_mod`);

        tableBody.innerHTML = '';
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last update: ${formatDate(modifiedVariable)}`;
        }

        data.forEach(item => {
            const row = document.createElement("tr");
            const periodCell = document.createElement("td");
            periodCell.textContent = item.Perioden;
            row.appendChild(periodCell);
            const conConf = document.createElement("td");
            conConf.textContent = item.Consumentenvertrouwen_1;
            row.appendChild(conConf);
            const ecoClimate = document.createElement("td");
            ecoClimate.textContent = item.EconomischKlimaat_2;
            row.appendChild(ecoClimate);
            const purPrep = document.createElement("td");
            purPrep.textContent = item.Koopbereidheid_3;
            row.appendChild(purPrep);
            tableBody.appendChild(row);
        });
    }

    function createConSentChart(data) {
        const labels = data.map(item => item.Perioden);
        const consumentenvertrouwenData = data.map(item => parseFloat(item.Consumentenvertrouwen_1));
        const economischKlimaatData = data.map(item => parseFloat(item.EconomischKlimaat_2));
        const koopbereidheidData = data.map(item => parseFloat(item.Koopbereidheid_3));

        const ctx = document.getElementById('cons_sent_Chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {label: 'Consumer confidence', data: consumentenvertrouwenData,
                        fill: false, borderColor: 'rgb(75, 192, 192)', tension: 0.1, pointRadius: 1, pointHoverRadius: 5,
                    },
                    {label: 'Economic climate', data: economischKlimaatData,
                        fill: false, borderColor: 'rgb(255, 99, 132)', tension: 0.1, pointRadius: 1, pointHoverRadius: 5,
                    },
                    {label: 'Purchase confidence', data: koopbereidheidData,
                        fill: false, borderColor: 'rgb(54, 162, 235)', tension: 0.1, pointRadius: 1, pointHoverRadius: 5,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true } },
                scales: {
                    x: {title: { display: false, text: 'Period' }, 
                        ticks: { maxTicksLimit: 6, autoSkip: true }
                    },
                    y: { title: { display: true, text: 'Sentiment levels' } }
                }
            }
        });
    }

    export async function ConSent_fetchTypedDataSet(years, html_table, metaTable) {
        const typedDataSetUrl = getTypedDataSetUrl_ConSent(years, metaTable);
        const tableInfosUrl = metaTable.value.find(entity => entity.name === 'TableInfos').url;

        try {const [typedDataResponse, tableInfosResponse] = await Promise.all([
                fetch(typedDataSetUrl, { method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}),
                fetch(tableInfosUrl, {method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}})
            ]);

            if (!typedDataResponse.ok || !tableInfosResponse.ok) throw new Error('HTTP error fetching data');

            const typedData = await typedDataResponse.json();
            const tableInfosData = await tableInfosResponse.json();

            const modifiedDate = tableInfosData.value.length > 0 ? tableInfosData.value[0].Modified : 'Not Available';

            const filteredData = typedData.value.filter(item => !item.Perioden.endsWith('00'))
                .reverse()
                .slice(0, 12)
                .map(item => {item.Perioden = item.Perioden.replace(/MM/, '_');  
                    return item;
                });

            ConSent_populateTable(filteredData, html_table, modifiedDate);
            console.log(filteredData);
            createConSentChart(filteredData.reverse());
            
        } catch (error) {
            console.error('Error fetching TypedDataSet or TableInfos:', error);
        }
    };




//  -----------------------------------------------------------------------------------------------------------
//  PPI -------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
    function getTypedDataSetUrl_PPI(years, AlleBedrijfstakken, Afzet, metadata) {
        const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
        const btak = `AlleBedrijfstakken eq '${AlleBedrijfstakken.join(",")}'`;
        const afzetFilter = `Afzet eq '${Afzet.join(",")}'`; 
        const filter = `${yearFilters} and ${btak} and ${afzetFilter}`;
        const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
            `?$filter=${filter}&$orderby=Perioden`; 
        return typedDataSetUrl;
    }

    function PPI_populateTable(data, tableName, modifiedVariable) {
        const tableBody = document.querySelector(`#${tableName} tbody`);
        const lastModifiedElement = document.querySelector(`#ppi_mod`);
        tableBody.innerHTML = '';
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last update: ${formatDate(modifiedVariable)}`;
        }

        data.forEach(item => {
            const row = document.createElement("tr");
            const periodCell = document.createElement("td");
            periodCell.textContent = item.Perioden;
            row.appendChild(periodCell);
            const cpiCell = document.createElement("td");
            cpiCell.textContent = item.ProducentenprijsindexPPI_1;
            row.appendChild(cpiCell);
            const maandmutatieCell = document.createElement("td");
            maandmutatieCell.textContent = item.MaandmutatiePPI_2;
            row.appendChild(maandmutatieCell);
            const jaarmutatieCell = document.createElement("td");
            jaarmutatieCell.textContent = item.JaarmutatiePPI_3;
            row.appendChild(jaarmutatieCell);
            tableBody.appendChild(row);
        });
    }

    function createPpiChart(data) {
        const labels = data.map(item => item.Perioden);
        const yearMutationData = data.map(item => parseFloat(item.JaarmutatiePPI_3));
    
        const ctx = document.getElementById('ppiChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Year Mutation (%)', data: yearMutationData,
                    fill: false, borderColor: 'rgb(75, 192, 192)', tension: 0.1, pointRadius: 1, pointHoverRadius: 5,
                }]
            },
            options: {
                responsive: true,
                plugins: {legend: { display: false }},
                scales: {
                    x: {title: {display: false, text: 'Period'}, 
                        ticks: { maxTicksLimit: 6, autoSkip: true, }  
                    },
                    y: {title: {display: true, text: 'Year Mutation (%)'}}
                }
            }
        });
    }
    

    export async function PPI_fetchTypedDataSet(years, AlleBedrijfstakken, Afzet, html_table, metaTable) {
        const typedDataSetUrl = getTypedDataSetUrl_PPI(years, AlleBedrijfstakken, Afzet, metaTable);
        const tableInfosUrl = metaTable.value.find(entity => entity.name === 'TableInfos').url;

        try {const [typedDataResponse, tableInfosResponse] = await Promise.all([
                fetch(typedDataSetUrl, { method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}),
                fetch(tableInfosUrl, {method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}})
            ]);

            if (!typedDataResponse.ok || !tableInfosResponse.ok) throw new Error('HTTP error fetching data');

            const typedData = await typedDataResponse.json();
            const tableInfosData = await tableInfosResponse.json();

            const modifiedDate = tableInfosData.value.length > 0 ? tableInfosData.value[0].Modified : 'Not Available';

            const filteredData = typedData.value.filter(item => !item.Perioden.endsWith('00')).reverse().slice(0, 12)
            .map(item => {item.Perioden = item.Perioden.replace(/MM/, '_');
                return item;
            });  

            PPI_populateTable(filteredData, html_table, modifiedDate);
            createPpiChart(filteredData.reverse());
            
        } catch (error) {
            console.error('Error fetching TypedDataSet:', error);
            }
    }


//  -----------------------------------------------------------------------------------------------------------
//  producer sentiment -------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
    function getTypedDataSetUrl_ProdSent(years, category, metadata) {
        const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
        const categoryFilter = `BedrijfstakkenBranchesSBI2008 eq '${category}'`;
        const filter = `${yearFilters} and ${categoryFilter}`;
        const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
            `?$filter=${filter}&$orderby=Perioden`; 
        return typedDataSetUrl;
    }

    function ProdSent_populateTable(data, tableName, modifiedVariable) {
        const tableBody = document.querySelector(`#${tableName} tbody`);
        const lastModifiedElement = document.querySelector(`#prod_sent_mod`);

        tableBody.innerHTML = '';
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last update: ${formatDate(modifiedVariable)}`;
        }

        data.forEach(item => {
            const row = document.createElement("tr");
            const periodCell = document.createElement("td");
            periodCell.textContent = item.Perioden;
            row.appendChild(periodCell);
            const prodConf = document.createElement("td");
            prodConf.textContent = item.Producentenvertrouwen_1;
            row.appendChild(prodConf);
            const busExpec = document.createElement("td");
            busExpec.textContent = item.VerwachteBedrijvigheid_2;
            row.appendChild(busExpec);
            const ordeConf = document.createElement("td");
            ordeConf.textContent = item.OordeelOrderpositie_3;
            row.appendChild(ordeConf);
            tableBody.appendChild(row);
        });
    }

    function createProdSentChart(data) {
        const labels = data.map(item => item.Perioden);
        const producerVertrouwenData = data.map(item => parseFloat(item.Producentenvertrouwen_1));
        const busExpec = data.map(item => parseFloat(item.VerwachteBedrijvigheid_2));
        const orderConfi = data.map(item => parseFloat(item.OordeelOrderpositie_3));

        const ctx = document.getElementById('prod_sent_Chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {label: 'Producer confidence', data: producerVertrouwenData,
                        fill: false, borderColor: 'rgb(75, 192, 192)', tension: 0.1, pointRadius: 1, pointHoverRadius: 5,},
                    {label: 'Business expectations', data: busExpec,
                        fill: false, borderColor: 'rgb(255, 99, 132)', tension: 0.1, pointRadius: 1, pointHoverRadius: 5,},
                    {label: 'Order positions', data: orderConfi,
                        fill: false, borderColor: 'rgb(54, 162, 235)', tension: 0.1, pointRadius: 1, pointHoverRadius: 5,}
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true } },
                scales: {
                    x: {title: { display: false, text: 'Period' }, 
                        ticks: { maxTicksLimit: 6, autoSkip: true }
                    },
                    y: { title: { display: true, text: 'Sentiment levels' } }
                }
            }
        });
    }

    export async function ProdSent_fetchTypedDataSet(years, category, html_table, metaTable) {
        const typedDataSetUrl = getTypedDataSetUrl_ProdSent(years, category, metaTable);
        const tableInfosUrl = metaTable.value.find(entity => entity.name === 'TableInfos').url;

        try {const [typedDataResponse, tableInfosResponse] = await Promise.all([
                fetch(typedDataSetUrl, { method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}),
                fetch(tableInfosUrl, {method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}})
            ]);

            if (!typedDataResponse.ok || !tableInfosResponse.ok) throw new Error('HTTP error fetching data');

            const typedData = await typedDataResponse.json();
            const tableInfosData = await tableInfosResponse.json();

            const modifiedDate = tableInfosData.value.length > 0 ? tableInfosData.value[0].Modified : 'Not Available';

            const filteredData = typedData.value.filter(item => !item.Perioden.endsWith('00'))
                .reverse()
                .slice(0, 12)
                .map(item => {item.Perioden = item.Perioden.replace(/MM/, '_');  
                    return item;
                });

            ProdSent_populateTable(filteredData, html_table, modifiedDate);
            createProdSentChart(filteredData.reverse());
            
        } catch (error) {
            console.error('Error fetching TypedDataSet or TableInfos:', error);
        }
    };


//  -----------------------------------------------------------------------------------------------------------
//  Service -------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
    function getTypedDataSetUrl_Service(years, AlleBedrijfstakken, metadata) {
        const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
        const btak = `BedrijfstakkenBranchesSBI2008 eq '${AlleBedrijfstakken.join("' or BedrijfstakkenBranchesSBI2008 eq '")}'`;
        const filter = `${yearFilters} and ${btak}`;
        const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
            `?$filter=${filter}&$orderby=Perioden`; 
        return typedDataSetUrl;
    }

    function Service_populateTable(data, tableName, modifiedVariable) {
        const tableBody = document.querySelector(`#${tableName} tbody`);
        const lastModifiedElement = document.querySelector(`#services_mod`);
        tableBody.innerHTML = '';
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last update: ${formatDate(modifiedVariable)}`;
        }
        const periods = {}; 

        data.forEach(item => {
            if (!periods[item.Perioden]) {
                periods[item.Perioden] = {
                    "354200": null,"383100": null,"389100": null,
                    "391600": null,"402000": null,"B000655": null,"410200": null
                };
            }

            // Assign values to respective sectors
            const sector = item.BedrijfstakkenBranchesSBI2008.trim();
            periods[item.Perioden][sector] = item.Ongecorrigeerd_1;
            
            // Assign values to the respective sectors
            // if (item.BedrijfstakkenBranchesSBI2008.trim() === "354200") {
            //     periods[item.Perioden]["354200"] = item.Ongecorrigeerd_1;
            // } else if (item.BedrijfstakkenBranchesSBI2008.trim() === "383100") {
            //     periods[item.Perioden]["383100"] = item.Ongecorrigeerd_1;
            // } else if (item.BedrijfstakkenBranchesSBI2008.trim() === "389100") {
            //     periods[item.Perioden]["389100"] = item.Ongecorrigeerd_1;
            // }

            // else if (item.BedrijfstakkenBranchesSBI2008.trim() === "391600") {
            //     periods[item.Perioden]["391600"] = item.Ongecorrigeerd_1;
            // }
            // else if (item.BedrijfstakkenBranchesSBI2008.trim() === "402000") {
            //     periods[item.Perioden]["402000"] = item.Ongecorrigeerd_1;
            // }
            // else if (item.BedrijfstakkenBranchesSBI2008.trim() === "B000655") {
            //     periods[item.Perioden]["B000655"] = item.Ongecorrigeerd_1;
            // }
            // else if (item.BedrijfstakkenBranchesSBI2008.trim() === "410200") {
            //     periods[item.Perioden]["410200"] = item.Ongecorrigeerd_1;
            // }
        });

        const last12Entries = Object.entries(periods).slice(0,12);

        // Populate the table rows
        for (const [period, values] of last12Entries) {
            const row = document.createElement("tr");
            const periodCell = document.createElement("td");
            periodCell.textContent = period;
            row.appendChild(periodCell);
            // Add cells for each sector
            // row.appendChild(createCell(values["354200"]));
            // row.appendChild(createCell(values["383100"]));
            // row.appendChild(createCell(values["389100"]));
            // row.appendChild(createCell(values["391600"]));
            // row.appendChild(createCell(values["402000"]));
            // row.appendChild(createCell(values["410200"]));
            // row.appendChild(createCell(values["B000655"]));
            // tableBody.appendChild(row);

            ["354200", "383100", "389100", "391600", "402000", "410200", "B000655"].forEach(sector => {
                row.appendChild(createCell(values[sector]));
            });
            tableBody.appendChild(row);
        }
        return periods; 
    }

    function createServiceChart(periods) {
        const ctx = document.getElementById('serviceChart').getContext('2d');

        const periodLabels = Object.keys(periods).slice(0, 12).reverse();
        const tradeData = periodLabels.map(period => periods[period]["354200"]);
        const transportStorageData = periodLabels.map(period => periods[period]["383100"]);
        const cateringData = periodLabels.map(period => periods[period]["389100"]);
        const techCommunicationData = periodLabels.map(period => periods[period]["391600"]);
        const realEstateData = periodLabels.map(period => periods[period]["402000"]);
        const servicesData = periodLabels.map(period => periods[period]["410200"]);
        const totalData = periodLabels.map(period => periods[period]["B000655"]);

        new Chart(ctx, {
            type: 'line',
            data: {labels: periodLabels,
                datasets: [
                    { label: 'Trade', data: tradeData, borderColor: 'rgba(75, 192, 192, 1)', fill: false, pointRadius: 1, pointHoverRadius: 5, },
                    { label: 'Transport & Storage', data: transportStorageData, borderColor: 'rgba(54, 162, 235, 1)', fill: false, pointRadius: 1, pointHoverRadius: 5, },
                    { label: 'Catering', data: cateringData, borderColor: 'rgba(255, 99, 132, 1)', fill: false, pointRadius: 1, pointHoverRadius: 5, },
                    { label: 'Tech & Commun', data: techCommunicationData, borderColor: 'rgba(153, 102, 255, 1)', fill: false, pointRadius: 1, pointHoverRadius: 5, },
                    { label: 'Real Estate', data: realEstateData, borderColor: 'rgba(255, 159, 64, 1)', fill: false, pointRadius: 1, pointHoverRadius: 5, },
                    { label: 'Services', data: servicesData, borderColor: 'rgba(255, 205, 86, 1)', fill: false, pointRadius: 1, pointHoverRadius: 5, },
                    // { label: 'Total', data: totalData, borderColor: 'rgba(100, 100, 100, 1)', fill: false, pointRadius: 1, pointHoverRadius: 5, },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: false, text: 'Period' }, ticks: { maxTicksLimit: 6, autoSkip: true, }  },
                    y: { title: { display: true, text: 'Index Value' }, beginAtZero: true },
                },
            },
        });
    }


    // Helper function to create a table cell
    function createCell(value) {
        const cell = document.createElement("td");
        cell.textContent = value !== null ? value : ""; 
        return cell;
    }

    export async function Service_fetchTypedDataSet(years, AlleBedrijfstakken, html_table, metaTable) {
        const typedDataSetUrl = getTypedDataSetUrl_Service(years, AlleBedrijfstakken, metaTable);
        const tableInfosUrl = metaTable.value.find(entity => entity.name === 'TableInfos').url;
        try {const [typedDataResponse, tableInfosResponse] = await Promise.all([
                fetch(typedDataSetUrl, { method: 'GET', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }),
                fetch(tableInfosUrl, { method: 'GET', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
            ]);
            if (!typedDataResponse.ok || !tableInfosResponse.ok) throw new Error('HTTP error fetching data');
            
            const typedData = await typedDataResponse.json();
            const tableInfosData = await tableInfosResponse.json();

            const modifiedDate = tableInfosData.value.length > 0 ? tableInfosData.value[0].Modified : 'Not Available';
            const filteredData = typedData.value
                .filter(item => 
                    !item.Perioden.endsWith('00') &&
                    !(item.Perioden.charAt(4) === 'K'))
                .reverse()
                .map(item => {item.Perioden = item.Perioden.replace(/MM/, '_');
                    return item;
                });
            const periods = Service_populateTable(filteredData, html_table, modifiedDate);
            createServiceChart(periods);
        } catch (error) {
            console.error('Error fetching TypedDataSet:', error);
        }
    }


//  -----------------------------------------------------------------------------------------------------------
//  Housing -------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
    function getTypedDataSetUrl_Housing(years, category, metadata) {
        const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
        const filter = `${yearFilters}`;
        const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
            `?$filter=${filter}&$orderby=Perioden`; 
        return typedDataSetUrl;
    }

    function Housing_populateTable(data, tableName, modifiedVariable) {
        const tableBody = document.querySelector(`#${tableName} tbody`);
        const lastModifiedElement = document.querySelector(`#housing_mod`);
        tableBody.innerHTML = '';
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last update: ${formatDate(modifiedVariable)}`;
        }


        data.forEach(item => {
            const row = document.createElement("tr");

            const periodCell = document.createElement("td");
            periodCell.textContent = item.Perioden;
            row.appendChild(periodCell);
            const indexCell = document.createElement("td");
            indexCell.textContent = item.PrijsindexVerkoopprijzen_1;
            row.appendChild(indexCell);
            const maandmutatieCell = document.createElement("td");
            maandmutatieCell.textContent = item.OntwikkelingTOVVoorgaandePeriode_2;
            row.appendChild(maandmutatieCell);
            const jaarmutatieCell = document.createElement("td");
            jaarmutatieCell.textContent = item.OntwikkelingTOVEenJaarEerder_3;
            row.appendChild(jaarmutatieCell);
            const objects_sale_Cell = document.createElement("td");
            objects_sale_Cell.textContent = item.VerkochteWoningen_4;
            row.appendChild(objects_sale_Cell);
            const objects_jaarmutatieCell = document.createElement("td");
            objects_jaarmutatieCell.textContent = item.OntwikkelingTOVEenJaarEerder_6;
            row.appendChild(objects_jaarmutatieCell);

            tableBody.appendChild(row);
        });
    }


    function createHousingChart(data) {
        const labels = data.map(item => item.Perioden);
        const yearMutationData = data.map(item => parseFloat(item.OntwikkelingTOVEenJaarEerder_3));
        const ctx = document.getElementById('HousingChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{label: 'Year Mutation (%)', data: yearMutationData, fill: false,
                    borderColor: 'rgb(75, 192, 192)', tension: 0.1, pointRadius: 1, pointHoverRadius: 5,
                }]
            },
            options: {
                responsive: true,
                plugins: {legend: { display: false }},
                scales: {
                    x: {title: {display: false, text: 'Period'}, 
                        ticks: {maxTicksLimit: 6, autoSkip: true, }  
                    },
                    y: {title: {display: true, text: 'Year Mutation in (%)'}}
                }
            }
        });
    }

    export async function Housing_fetchTypedDataSet(years, category, html_table, metaTable) {
        const typedDataSetUrl = getTypedDataSetUrl_Housing(years, category, metaTable);
        const tableInfosUrl = metaTable.value.find(entity => entity.name === 'TableInfos').url;
        try {const [typedDataResponse, tableInfosResponse] = await Promise.all([
                fetch(typedDataSetUrl, { method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}),
                fetch(tableInfosUrl, {method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}})
            ]);

            if (!typedDataResponse.ok || !tableInfosResponse.ok) throw new Error('HTTP error fetching data');

            const typedData = await typedDataResponse.json();
            const tableInfosData = await tableInfosResponse.json();

            const modifiedDate = tableInfosData.value.length > 0 ? tableInfosData.value[0].Modified : 'Not Available';

            const filteredData = typedData.value
                .filter(item => 
                    !item.Perioden.endsWith('00') &&
                    !(item.Perioden.charAt(4) === 'K'))
                .reverse()
                .slice(0,12)
                .map(item => {item.Perioden = item.Perioden.replace(/MM/, '_');
                    return item;
            });

            Housing_populateTable(filteredData, html_table, modifiedDate);
            createHousingChart(filteredData.reverse());
            
        } catch (error) {
            console.error('Error fetching TypedDataSet:', error);
            }
    }


//  -----------------------------------------------------------------------------------------------------------
//  Employment by brances-------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
    function getTypedDataSetUrl_Employment(years, AlleBedrijfstakken, kenmerkenbaan, metadata) {
        const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
        const btak = `BedrijfstakkenBranchesSBI2008 eq '${AlleBedrijfstakken.join("' or BedrijfstakkenBranchesSBI2008 eq '")}'`;
        const kenmerkenFilter = `KenmerkenBaan eq '${kenmerkenbaan}'`;
        const filter = `${yearFilters} and ${btak} and ${kenmerkenFilter}`;
        const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
            `?$filter=${filter}&$orderby=Perioden`; 
        return typedDataSetUrl;
    }

    function Employment_populateTable(data, tableName, modifiedVariable) {
        const tableBody = document.querySelector(`#${tableName} tbody`);
        const lastModifiedElement = document.querySelector(`#Employ_mod`);
        tableBody.innerHTML = '';
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last update: ${formatDate(modifiedVariable)}`;
        }
        const periods = {}; 

        data.forEach(item => {
            if (!periods[item.Perioden]) {
                periods[item.Perioden] = {
                    "T001081": null,"301000": null,"300002": null,"350000": null,"354200": null,"383100": null,"389100": null,
                    "391600": null,"396300": null,"402000": null,"300010": null,"300012": null,"300014": null
                };
            }

            const sector = item.BedrijfstakkenBranchesSBI2008.trim();
            periods[item.Perioden][sector] = item.BanenMetSeizoenscorrectie_1;
            
        });

        const last12Entries = Object.entries(periods).slice(0,12);

        // Populate the table rows
        for (const [period, values] of last12Entries) {
            const row = document.createElement("tr");
            const periodCell = document.createElement("td");
            periodCell.textContent = period;
            row.appendChild(periodCell);

            ["T001081","301000","300002","350000","354200","383100","389100","391600","396300","402000", "300010", "300012","300014"].forEach(sector => {
                row.appendChild(createCell(values[sector]));
            });
            tableBody.appendChild(row);
        }
        return periods; 
    }

    function createEmploymentChart(periods) {
        const ctx = document.getElementById('EmployChart').getContext('2d');

        const periodLabels = Object.keys(periods).slice(0, 12).reverse();
        // const tradeData = periodLabels.map(period => periods[period]["354200"]);
        // const transportStorageData = periodLabels.map(period => periods[period]["383100"]);
        // const cateringData = periodLabels.map(period => periods[period]["389100"]);
        // const techCommunicationData = periodLabels.map(period => periods[period]["391600"]);
        // const realEstateData = periodLabels.map(period => periods[period]["402000"]);
        // const servicesData = periodLabels.map(period => periods[period]["410200"]);
        const totalData = periodLabels.map(period => periods[period]["T001081"]);

        new Chart(ctx, {
            type: 'line',
            data: {labels: periodLabels,
                datasets: [
                    // { label: 'Trade', data: tradeData, borderColor: 'rgba(75, 192, 192, 1)', fill: false },
                    // { label: 'Transport & Storage', data: transportStorageData, borderColor: 'rgba(54, 162, 235, 1)', fill: false },
                    // { label: 'Catering', data: cateringData, borderColor: 'rgba(255, 99, 132, 1)', fill: false },
                    // { label: 'Tech & Commun', data: techCommunicationData, borderColor: 'rgba(153, 102, 255, 1)', fill: false },
                    // { label: 'Real Estate', data: realEstateData, borderColor: 'rgba(255, 159, 64, 1)', fill: false },
                    // { label: 'Services', data: servicesData, borderColor: 'rgba(255, 205, 86, 1)', fill: false },
                    { label: 'Total', data: totalData, borderColor: 'rgba(75, 192, 192)', fill: false, pointRadius: 1, pointHoverRadius: 5, },
                ],
            },
            options: {
                responsive: true, plugins: {legend: { display: false }},
                scales: {x: { title: { display: false, text: 'Period' }, ticks: { maxTicksLimit: 6, autoSkip: true, }  },
                    y: { title: { display: true, text: 'Total employment (x1000)' }, beginAtZero: true },
                },
            },
        });
    }


    export async function Employment_fetchTypedDataSet(years, AlleBedrijfstakken, kenmerkenbaan, html_table, metaTable) {
        const typedDataSetUrl = getTypedDataSetUrl_Employment(years, AlleBedrijfstakken, kenmerkenbaan, metaTable);
        const tableInfosUrl = metaTable.value.find(entity => entity.name === 'TableInfos').url;
        try {const [typedDataResponse, tableInfosResponse] = await Promise.all([
                fetch(typedDataSetUrl, { method: 'GET', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }),
                fetch(tableInfosUrl, { method: 'GET', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
            ]);
            if (!typedDataResponse.ok || !tableInfosResponse.ok) throw new Error('HTTP error fetching data');
            
            const typedData = await typedDataResponse.json();
            const tableInfosData = await tableInfosResponse.json();

            const modifiedDate = tableInfosData.value.length > 0 ? tableInfosData.value[0].Modified : 'Not Available';
            const filteredData = typedData.value
                .filter(item => 
                    !item.Perioden.endsWith('00') &&
                    !(item.Perioden.charAt(4) === 'K'))
                .reverse()
                .map(item => {item.Perioden = item.Perioden.replace(/MM/, '_');
                    return item;
                });
            const periods = Employment_populateTable(filteredData, html_table, modifiedDate);
            createEmploymentChart(periods);
        } catch (error) {
            console.error('Error fetching TypedDataSet:', error);
        }
    }

//  -----------------------------------------------------------------------------------------------------------
//  Salary by brances-------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
    function getTypedDataSetUrl_Salary(years, AlleBedrijfstakken, kenmerkenbaan, metadata) {
        const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
        const btak = `BedrijfstakkenBranchesSBI2008 eq '${AlleBedrijfstakken.join("' or BedrijfstakkenBranchesSBI2008 eq '")}'`;
        const kenmerkenFilter = `KenmerkenBaan eq '${kenmerkenbaan}'`;
        const filter = `${yearFilters} and ${btak} and ${kenmerkenFilter}`;
        const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
            `?$filter=${filter}&$orderby=Perioden`; 
        return typedDataSetUrl;
    }

    function Salary_populateTable(data, tableName, modifiedVariable) {
        const tableBody = document.querySelector(`#${tableName} tbody`);
        const lastModifiedElement = document.querySelector(`#Salary_mod`);
        tableBody.innerHTML = '';
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last update: ${formatDate(modifiedVariable)}`;
        }
        const periods = {}; 

        data.forEach(item => {
            if (!periods[item.Perioden]) {
                periods[item.Perioden] = {
                    "T001081": null,"301000": null,"300002": null,"350000": null,"354200": null,"383100": null,"389100": null,
                    "391600": null,"396300": null,"402000": null,"300010": null,"300012": null,"300014": null
                };
            }

            const sector = item.BedrijfstakkenBranchesSBI2008.trim();
            periods[item.Perioden][sector] = item.MaandloonInclusiefOverwerk_5;
            
        });

        const last12Entries = Object.entries(periods).slice(0,12);

        // Populate the table rows
        for (const [period, values] of last12Entries) {
            const row = document.createElement("tr");
            const periodCell = document.createElement("td");
            periodCell.textContent = period;
            row.appendChild(periodCell);

            ["T001081","301000","300002","350000","354200","383100","389100","391600","396300","402000", "300010", "300012","300014"].forEach(sector => {
                row.appendChild(createCell(values[sector]));
            });
            tableBody.appendChild(row);
        }
        return periods; 
    }

    function createSalaryChart(periods) {
        const ctx = document.getElementById('SalaryChart').getContext('2d');

        const periodLabels = Object.keys(periods).slice(0, 12).reverse();
        const totalData = periodLabels.map(period => periods[period]["T001081"]);

        new Chart(ctx, {
            type: 'line',
            data: {labels: periodLabels,
                datasets: [
                    { label: 'Total', data: totalData, borderColor: 'rgba(75, 192, 192)', fill: false, pointRadius: 1, pointHoverRadius: 5, },
                ],
            },
            options: {
                responsive: true, plugins: {legend: { display: false }},
                scales: {x: { title: { display: false, text: 'Period' }, ticks: { maxTicksLimit: 6, autoSkip: true, }  },
                    y: { title: { display: true, text: 'Total avg Gross salary (€)' }, beginAtZero: true },
                },
            },
        });
    }


    export async function Salary_fetchTypedDataSet(years, AlleBedrijfstakken, kenmerkenbaan, html_table, metaTable) {
        const typedDataSetUrl = getTypedDataSetUrl_Salary(years, AlleBedrijfstakken, kenmerkenbaan, metaTable);
        const tableInfosUrl = metaTable.value.find(entity => entity.name === 'TableInfos').url;
        try {const [typedDataResponse, tableInfosResponse] = await Promise.all([
                fetch(typedDataSetUrl, { method: 'GET', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }),
                fetch(tableInfosUrl, { method: 'GET', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
            ]);
            if (!typedDataResponse.ok || !tableInfosResponse.ok) throw new Error('HTTP error fetching data');
            
            const typedData = await typedDataResponse.json();
            const tableInfosData = await tableInfosResponse.json();

            const modifiedDate = tableInfosData.value.length > 0 ? tableInfosData.value[0].Modified : 'Not Available';
            const filteredData = typedData.value
                .filter(item => 
                    !item.Perioden.endsWith('00') &&
                    !(item.Perioden.charAt(4) === 'K'))
                .reverse()
                .map(item => {item.Perioden = item.Perioden.replace(/MM/, '_');
                    return item;
                });
            const periods = Salary_populateTable(filteredData, html_table, modifiedDate);
            createSalaryChart(periods);
        } catch (error) {
            console.error('Error fetching TypedDataSet:', error);
        }
    }

//  -----------------------------------------------------------------------------------------------------------
//  Unemployment -------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
    function getTypedDataSetUrl_Unemploy(years, geslacht, leeftijd,  metadata) {
        const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
        const btak = `Geslacht eq '${geslacht}'`;
        const kenmerkenFilter = `Leeftijd eq '${leeftijd}'`;
        const filter = `${yearFilters} and ${btak} and ${kenmerkenFilter}`;
        const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
            `?$filter=${filter}&$orderby=Perioden`; 
        return typedDataSetUrl;
    }

    function Unemploy_populateTable(data, tableName, modifiedVariable) {
        const tableBody = document.querySelector(`#${tableName} tbody`);
        const lastModifiedElement = document.querySelector(`#Unemploy_mod`);
        tableBody.innerHTML = '';
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last update: ${formatDate(modifiedVariable)}`;
        }


        data.forEach(item => {
            const row = document.createElement("tr");

            const periodCell = document.createElement("td");
            periodCell.textContent = item.Perioden;
            row.appendChild(periodCell);
            const totalCell = document.createElement("td");
            totalCell.textContent = item.Seizoengecorrigeerd_2;
            row.appendChild(totalCell);
            const umemployNCell = document.createElement("td");
            umemployNCell.textContent = item.Seizoengecorrigeerd_6;
            row.appendChild(umemployNCell);
            const umemployRateCell = document.createElement("td");
            umemployRateCell.textContent = item.Seizoengecorrigeerd_8;
            row.appendChild(umemployRateCell);

            tableBody.appendChild(row);
        });
    }


    function createUnemployChart(data) {
        const labels = data.map(item => item.Perioden);
        const yearMutationData = data.map(item => parseFloat(item.Seizoengecorrigeerd_8));
        const ctx = document.getElementById('UnemployChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{label: 'Unemployment rate (%)', data: yearMutationData, fill: false,
                    borderColor: 'rgb(75, 192, 192)', tension: 0.1, pointRadius: 1, pointHoverRadius: 5,
                }]
            },
            options: {
                responsive: true,
                plugins: {legend: { display: false }},
                scales: {
                    x: {title: {display: false, text: 'Period'}, 
                        ticks: {maxTicksLimit: 6, autoSkip: true, }  
                    },
                    y: {title: {display: true, text: 'Unemployment rate in (%)'}}
                }
            }
        });
    }

    export async function Unemploy_fetchTypedDataSet(years, geslacht, leeftijd, html_table, metaTable) {
        const typedDataSetUrl = getTypedDataSetUrl_Unemploy(years, geslacht, leeftijd, metaTable);
        const tableInfosUrl = metaTable.value.find(entity => entity.name === 'TableInfos').url;
        try {const [typedDataResponse, tableInfosResponse] = await Promise.all([
                fetch(typedDataSetUrl, { method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}),
                fetch(tableInfosUrl, {method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}})
            ]);

            if (!typedDataResponse.ok || !tableInfosResponse.ok) throw new Error('HTTP error fetching data');

            const typedData = await typedDataResponse.json();
            const tableInfosData = await tableInfosResponse.json();

            const modifiedDate = tableInfosData.value.length > 0 ? tableInfosData.value[0].Modified : 'Not Available';

            const filteredData = typedData.value
                .filter(item => 
                    !item.Perioden.endsWith('00') &&
                    !(item.Perioden.charAt(4) === 'K') &&
                    !(item.Perioden.charAt(4) === 'J'))
                .reverse()
                .slice(0,12)
                .map(item => {item.Perioden = item.Perioden.replace(/MM/, '_');
                    return item;
            });

            Unemploy_populateTable(filteredData, html_table, modifiedDate);
            createUnemployChart(filteredData.reverse());
            
        } catch (error) {
            console.error('Error fetching TypedDataSet:', error);
            }
    }