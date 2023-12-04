//const BASE_URL = 'https://palette-place.onrender.com/';
const BASE_URL = 'http://127.0.0.1:5000/'

async function toggleFavorite(){
    //Toggles the palette as a user's favorite
    let $favBut = $('#toggle-fav');
    let $numFavs = $('#num-favs');
    $favBut.on('click', async function(){
        if ($favBut.hasClass('btn-warning')){
            let palID= $favBut.data('palid');
            let res = await axios.get(`${BASE_URL}/palettes/${palID}/favorite`);
            if (res.status == 200){
                $favBut.toggleClass('btn-warning');
                $favBut.toggleClass('btn-danger');
                $favBut.text('Unfavorite');
                $numFavs.text(parseInt($numFavs.text())+1);
            };
            return;
        };
        if ($favBut.hasClass('btn-danger')){
            let palID= $favBut.data('palid');
            let res = await axios.get(`${BASE_URL}/palettes/${palID}/unfavorite`);
            if (res.status == 200){
                $favBut.toggleClass('btn-warning');
                $favBut.toggleClass('btn-danger');
                $favBut.text('Favorite');
                $numFavs.text(parseInt($numFavs.text())-1);
            };
            return;
        };
    });
};
toggleFavorite();