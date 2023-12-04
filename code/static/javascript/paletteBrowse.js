const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const pageNum = parseInt(params.get('page'));
const searchName = parseStringInput(params.get('name'));
const searchUser = parseStringInput(params.get('user'));
const searchTags = params.get('tags');
let searchTagsList = parseSearchTags();

let $nextBut = $('#next-but');
let $prevBut = $('#prev-but');
let $searchBut = $('#search-button');

let $nameBar = $('#name-search');
let $userBar = $('#user-search');

function parseStringInput(input){
    //Returns a string or null, incase someone entered a number to search
    if (input != null){
        return String(input);
    }else{
        return null;
    };
};

function parseSearchTags(){
    //Splits the tag params into a list
    if(searchTags != undefined){
        return searchTags.split('+');
    }else{
        return null;
    };
};

function fillSearchBars(){
    //Function to autofill the search bars if there are query params
    if (searchName != null){
        $nameBar.val(searchName);
    };
    if (searchUser != null){
        $userBar.val(searchUser);
    };
    if(searchTagsList != null){
        searchTagsList.forEach((tag) => addTag(tag.split("_").map((word) => {return word[0].toUpperCase() + word.substring(1)}).join(" ")));
    };
};
fillSearchBars();

$searchBut.on('click', (e) =>{
    //Function to generate the search string and go
    e.preventDefault();
    let newURL = `${BASE_URL}palettes/browse?page=0`;

    let nameVal = $nameBar.val()
    if (nameVal != null && nameVal.length > 0){
        newURL = newURL + `&name=${nameVal}`;
    };

    let userVal = $userBar.val();
    if (userVal != null && userVal.length > 0){
        newURL = newURL + `&user=${userVal}`;
    };

    if (addedTags.children().length > 0){
        let tagVal = "";
        addedTags.children().each((idx, tag) =>{
            tagName = $(tag).attr('id');
            tagConvert = tagName.toLowerCase().replace(" ", "_");
            tagVal = tagVal + tagConvert;
        });
        newURL = newURL + `&tags=${tagVal}`;
    };
    window.location.replace(newURL);
});

$nextBut.on('click', (e) =>{
    //Listener to go to the next page and keep query params
    e.preventDefault();
    let newURL = `${BASE_URL}palettes/browse?page=${pageNum+1}`;
    if(searchName != null && searchName.length > 0){
        newUrl = newURL + `&name=${searchName}`;
    };
    if(searchUser != null && searchUser.length > 0){
        newURL = newURL + `&user=${searchUser}`;
    };
    if (searchTags != null && searchTags.length > 0){
        newURL = newURL + `&tags=${searchTags}`;
    };
    window.location.replace(newURL)
});

$prevBut.on('click', (e) =>{
    //Listener to go to the prev page and keep query params
    e.preventDefault();
    let newURL = `${BASE_URL}palettes/browse?page=${pageNum-1}`;
    if(searchName != null && searchName.length > 0){
        newUrl = newURL + `&name=${searchName}`;
    };
    if(searchUser != null && searchUser.length > 0){
        newURL = newURL + `&user=${searchUser}`;
    };
    if (searchTags != null && searchTags.length > 0){
        newURL = newURL + `&tags=${searchTags}`;
    };
    window.location.replace(newURL)
});

//Hides the previous button on the first page
if (pageNum==0){
    $('#prev-but').hide();
};

async function checkForMorePalettes(){
    //Checks for more palettes with the CHECK flag and hides the next button if true
    let newURL = `${BASE_URL}palettes/browse?page=${pageNum+1}`;
    if(searchName != null && searchName.length > 0){
        newURL = newURL + `&name=${searchName}`;
    };
    if(searchUser != null && searchUser.length > 0){
        newURL = newURL + `&user=${searchUser}`;
    };
    if (searchTags != null && searchTags.length > 0){
        newURL = newURL + `&tags=${searchTags}`;
    };
    let response = await axios.get(newURL+'&check=True');
    if (response.data.more == false){
        $nextBut.hide();
    };
};
checkForMorePalettes();