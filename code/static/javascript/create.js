const BASE_URL = 'http://127.0.0.1:5000/';

async function makeFirstColor(){
    let jsonData = JSON.stringify({model : 'default'})
    let resp = await axios.post('http://colormind.io/api/', jsonData, );
    $('#test-p1').text(resp.data.result);
    $('#test-p2').text(resp.status);
}

makeFirstColor();