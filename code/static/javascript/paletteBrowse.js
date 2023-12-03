//const BASE_URL = 'https://palette-place.onrender.com/';
const BASE_URL = 'http://127.0.0.1:5000/'
const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const pageNum = parseInt(params.get('page'));
const searchName = params.get('name');
const searchUser = params.get('user');
const searchTags = params.get('tags');
let searchTagsList = parseSearchTags();

console.log(pageNum,searchName,searchUser,searchTagsList);

let $nextBut = $('#next-but');
let $prevBut = $('#prev-but');

function parseSearchTags(){
    if(searchTags != undefined){
        return searchTags.split('+');
    }else{
        return null;
    };
};

$nextBut.on('click', () =>{
    let newURL = `${BASE_URL}palettes/browse?page=${pageNum+1}`;
    if(searchName != null){
        newUrl = newURL + `&name=${searchName}`;
    };
    if(searchUser != null){
        newURL = newURL + `&user=${searchUser}`;
    };
    if (searchTags != null){
        newURL = newURL + `&tags=${searchTags}`;
    };
    window.location.replace(newURL)
});

$prevBut.on('click', () =>{
    let newURL = `${BASE_URL}palettes/browse?page=${pageNum-1}`;
    if(searchName != null){
        newUrl = newURL + `&name=${searchName}`;
    };
    if(searchUser != null){
        newURL = newURL + `&user=${searchUser}`;
    };
    if (searchTags != null){
        newURL = newURL + `&tags=${searchTags}`;
    };
    window.location.replace(newURL)
});

if (pageNum==0){
    $('#prev-but').hide();
};

async function checkForMorePalettes(){
    let newURL = `${BASE_URL}palettes/browse?page=${pageNum+1}`;
    if(searchName != null){
        newUrl = newURL + `&name=${searchName}`;
    };
    if(searchUser != null){
        newURL = newURL + `&user=${searchUser}`;
    };
    if (searchTags != null){
        newURL = newURL + `&tags=${searchTags}`;
    };
    let response = await axios.get(newURL+'&check=True');
    if (response.data.more == false){
        $nextBut.hide();
    };
};
checkForMorePalettes();