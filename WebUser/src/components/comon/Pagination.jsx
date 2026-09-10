export default function Pagination({currentPage,totalPages,setCurrentPage}){
    return(
        <div className='flex items-center justify-center gap-2 mt-8'>
            <button
                onClick={()=> setCurrentPage((prev)=>Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className ='px-3 py-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100'
            >
                Trước
            </button>
            {Array.from(
                { length: totalPages },
                (_, index) => index + 1
            ).map((page) => (
                <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg ${
                        currentPage === page
                            ? 'bg-[#006971] text-white'
                            : 'border text-gray-600 hover:bg-[#E2F5F6]'
                    }`}
                >
                    {page}
                </button>
            ))}
             <button
                onClick={()=> setCurrentPage((prev)=>Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className ='px-3 py-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100'
            >
                Sau
            </button>
        </div>
    );
}