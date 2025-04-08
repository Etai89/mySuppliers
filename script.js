$(document).ready(async () => {
    let supplierName = ""
    let count = 0
    $('#productsLength').text(count)
    let allData = []

    function getSupplierTextByValue(value) {
        return $(`#supplier option[value="${value}"]`).text()
    }

    async function fetchData(supplierName) {
        let response = await fetch(`./${supplierName}.json`)
        const data = await response.json()
        return { supplierName, data }
    }

    function renderItems(filteredData) {
        let html = ""
        count = filteredData.length
        $('#productsLength').text(count)

        filteredData.map(item => {
            const priceHtml = item.price ? `<h2><strong>מחיר: ${item.price}₪</strong></h2>` : ''
            const linkTo = item.link ? `<h2><a href="${item.link}" target="_blank">לצפייה במוצר</a></h2>` : ''
            const supplierText = getSupplierTextByValue(item.supplierName || $('#supplier').val())
            const quantityProduct = item.quantity ? `<p><strong>כמות: ${item.quantity}</strong></p>` : ''
            html += `
            <div class="info">
                <img class="images" src="${item.imgSrc || item.image}" />
                <div class="dataInfo">
                    <h3>${item.name}</h3>
                    <h4>מק"ט: ${item.code || ""}</h4>
                    <p>${item.qtyInPack || ""}</p>
                    <p>${item.weight || ""}</p>
                    <p><strong>${item.stock || ''}</strong></p>
                    ${linkTo}
                    ${quantityProduct}
                    ${priceHtml}
                    <p><strong>ספק: ${supplierText}</strong></p>
                </div>
            </div>
            `
        })
        $('.container').html(html)
    }

    async function loadAllData() {
        const suppliers = ['mehaliZahav', 'arelArizot', 'lebelData', 'foodorData', 'ahimCohenData', 'shabiData', 'almandosData', "mysterData", "polivaData"]
        allData = []

        for (let supplier of suppliers) {
            const { supplierName, data } = await fetchData(supplier)
            data.forEach(item => {
                item.supplierName = supplierName
            })
            allData = [...allData, ...data]
        }
    }

    $('#globalSearch').on('input', () => {
        $('#supplier').val("choose")
        const searchTerm = $('#globalSearch').val().toLowerCase()
        const filteredData = allData.filter(item => item.name.toLowerCase().includes(searchTerm))
        renderItems(filteredData)
    })

    $('#supplier').on('change', async () => {
        supplierName = $('#supplier').val()
        const { data } = await fetchData(supplierName)
        window.fetchedData = data
        renderItems(data)

        $('#search').off('input').on('input', () => {
            const searchTerm = $('#search').val().toLowerCase()
            const filteredData = data.filter(item => item.name.toLowerCase().includes(searchTerm))
            renderItems(filteredData)
        })
    })

    await loadAllData()
    renderItems(allData)

    function extractProductDataToCSV() {
        const filteredData = window.fetchedData.filter(item =>
            item.name.toLowerCase().includes($('#search').val().toLowerCase())
        )

        const rows = [['שם מוצר', 'מק״ט', 'כמות בחבילה', 'מלאי זמין', 'מחיר']]

        filteredData.forEach(item => {
            const name = item.name || ''
            const code = item.code || ''
            const qty = item.qtyInPack || ''
            const stock = item.stock || ''
            const price = item.price ? `${item.price}₪` : ''
            rows.push([name, code, qty, stock, price])
        })

        const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
        const link = document.createElement('a')
        const sup_name = $('#supplier').val()
        link.href = URL.createObjectURL(blob)
        link.download = `${sup_name}_products.csv`
        link.click()
    }

    $("#extract").on('click', () => {
        extractProductDataToCSV()
    })
})
