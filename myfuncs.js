
//  -----------------------------------------------------------------------------------------------------------
//  CPI -------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
        // function getTypedDataSetUrl_CPI(years, category, metadata) {
        //     // Create a dynamic filter based on the years provided
        //     const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
        //     const categoryFilter = `Bestedingscategorieen eq '${category}'`;
        //     const filter = `${yearFilters} and ${categoryFilter}`;
        //     // Construct the final URL
        //     const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
        //         `?$filter=${filter}&$orderby=Perioden`; // Change ordering and top values as needed
        //     return typedDataSetUrl;
        // }

        // function CPI_populateTable(data, tableName) {
        //     const tableBody = document.querySelector(`#${tableName} tbody`);
        //     // Clear the existing table rows
        //     tableBody.innerHTML = '';
        //     // Loop through each item and create a row with the required columns
        //     data.forEach(item => {
        //         const row = document.createElement("tr");
        //         // Create cells for each column
        //         const periodCell = document.createElement("td");
        //         periodCell.textContent = item.Perioden;
        //         row.appendChild(periodCell);
        //         const cpiCell = document.createElement("td");
        //         cpiCell.textContent = item.CPI_1;
        //         row.appendChild(cpiCell);
        //         const maandmutatieCell = document.createElement("td");
        //         maandmutatieCell.textContent = item.MaandmutatieCPI_3;
        //         row.appendChild(maandmutatieCell);
        //         const jaarmutatieCell = document.createElement("td");
        //         jaarmutatieCell.textContent = item.JaarmutatieCPI_5;
        //         row.appendChild(jaarmutatieCell);
        //         // Append the row to the table body
        //         tableBody.appendChild(row);
        //     });
        // }

        // async function fetchTypedDataSet(years, category, html_table, metaTable) {
        //     const typedDataSetUrl = getTypedDataSetUrl_CPI(years, category, metaTable);
        //     try {
        //         const response = await fetch(typedDataSetUrl, {
        //             method: 'GET',
        //             headers: {
        //                 'Accept': 'application/json',
        //                 'Content-Type': 'application/json'
        //             }
        //         });
        //         if (!response.ok) {
        //             throw new Error(`HTTP error! status: ${response.status}`);
        //         }
        //         const data = await response.json();
        //         // Filter out entries where Perioden ends with "00"
        //         const filteredData = data.value.filter(item => !item.Perioden.endsWith('00')).reverse().slice(0, 12);       
        //         // console.log('Fetched Data:', JSON.stringify(filteredData, null, 2)); // Log the fetched data

        //         // Populate the table with filtered data
        //         if (html_table=="CpiTable") {
        //             CPI_populateTable(filteredData, html_table);
        //         }
        //     } catch (error) {
        //         console.error('Error fetching TypedDataSet:', error);
        //         }
        // }
        // Example usage
        // fetchTypedDataSet(['2024', '2023'], 'T001112  ', "CpiTable", CPI_metadata); 

//  -----------------------------------------------------------------------------------------------------------
//  PPI -------------------------------------------------------------------------------------------  
//  -----------------------------------------------------------------------------------------------------------  
        function getTypedDataSetUrl_PPI(years, AlleBedrijfstakken, Afzet, metadata) {
            // Create a dynamic filter based on the years provided
            const yearFilters = years.map(year => `substringof('${year}', Perioden)`).join(' or ');
            const btak = `AlleBedrijfstakken eq '${AlleBedrijfstakken.join(",")}'`;
            const afzetFilter = `Afzet eq '${Afzet.join(",")}'`; 
            const filter = `${yearFilters} and ${btak} and ${afzetFilter}`;
            const typedDataSetUrl = metadata.value.find(entity => entity.name === 'TypedDataSet').url + 
                `?$filter=${filter}&$orderby=Perioden`; // Change ordering and top values as needed
            return typedDataSetUrl;
        }
        // const datadata = getTypedDataSetUrl_PPI(['2024', '2023'], ['300002'],['A044074'], PPI_metadata);
        function PPI_populateTable(data, tableName) {
            const tableBody = document.querySelector(`#${tableName} tbody`);
            tableBody.innerHTML = '';
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

        export async function PPI_fetchTypedDataSet(years, AlleBedrijfstakken, Afzet, html_table, metaTable) {
            const typedDataSetUrl = getTypedDataSetUrl_PPI(years, AlleBedrijfstakken, Afzet, metaTable);
            try {
                const response = await fetch(typedDataSetUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // Filter out entries where Perioden ends with "00"
                const filteredData = data.value.filter(item => !item.Perioden.endsWith('00')).reverse().slice(0, 12)
                .map(item => {
                    // Modify the Perioden format by replacing MM with a hyphen
                    item.Perioden = item.Perioden.replace(/MM/, '_');
                    return item;
                });  


                PPI_populateTable(filteredData, html_table);
                
            } catch (error) {
                console.error('Error fetching TypedDataSet:', error);
                }
        }


