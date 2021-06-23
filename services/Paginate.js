const Paginate = (data, limit, currentPage) => {

    const NumberOfPages = Math.ceil(data.length / limit);
    if(currentPage > NumberOfPages) {
        currentPage = NumberOfPages
    }
    const IndexMax = currentPage * limit;
    const IndexMin = IndexMax - limit;
    const infos = {}
    infos.totalPages = NumberOfPages
    infos.currentPage = parseInt(currentPage, 10);
    infos.elementsPerPage = parseInt(limit, 10);
    data = data.slice(IndexMin, IndexMax);
    return {infos, elements: data}
}

module.exports = Paginate