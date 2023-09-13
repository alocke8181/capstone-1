const BASE_URL = 'http://127.0.0.1:5000/';
let loadCounter = 1;
let $palDiv = $('#pal-div');
async function loadMorePalettes(){
    let $loadBut = $('#load-but')
    $loadBut.on('click', async function(){
        let response = await axios.get(`${BASE_URL}/palettes/browse/load?page=${loadCounter}`);
        loadCounter++;
        let palettes = response.data['palettes'];
        for (let eachPalette in palettes){
            let eachPal = generateHTMLPrev(palettes[eachPalette]);
            $palDiv.append($(eachPal));
        };
        if (palettes.length < 16){
            $loadBut.text('No More Palettes');
            $loadBut.removeClass('btn-primary');
            $loadBut.addClass('btn-danger');
            $loadBut.unbind('click');
            $loadBut.prop('disabled',true)
        };
        if (palettes.length == 16){
            let response = await axios.get(`${BASE_URL}/palettes/browse/load?page=${loadCounter}`);
            let palettes = response.data['palettes'];
            if (palettes.length == 0){
                $loadBut.text('No More Palettes');
                $loadBut.removeClass('btn-primary');
                $loadBut.addClass('btn-danger');
                $loadBut.unbind('click');
                $loadBut.prop('disabled',true)
            };
        };
    });
};
loadMorePalettes();

function generateHTMLPrev(palette){
    let name = palette['name'];
    let id = palette['id'];
    let userID = palette['user_id'];
    let user = palette['user'];
    let main = palette['main'];
    let lightC = palette['light_c'];
    let lightA = palette['light_a'];
    let darkC = palette['dark_c'];
    let darkA = palette['dark_a'];

    let htmlString = 
    `<div class="palette-prev ${name}">
        <div class="color-main" id="color-main" style="background-color: ${main};"></div>
        <div class="color-small no-left-border" id="color-light-c" style="background-color: ${lightC};"></div>
        <div class="color-small" id="color-light-a" style="background-color: ${lightA};"></div>
        <div class="color-small" id="color-dark-c" style="background-color: ${darkC};"></div>
        <div class="color-small no-right-border" id="color-dark-a" style="background-color: ${darkA};"></div>
        <a href='/palettes/${id}'>
            <h6>${name}</h6>
        </a>
        <i>Created by <a href="/users/${userID}">${user}</a></i>
    </div>`;
    return htmlString;
}