function populateColorHeaders(){
    //Helper function to populate the color headers
    let $colorHeaders = $('.color-header')
    console.log($colorHeaders)
    const headerTexts = ['Main Color','Light Color','Light Accent','Dark Color','Dark Accent'];
    for (let i =0; i<5; i++){
        console.log($colorHeaders.get(i));
        $colorHeaders.get(i).innerText = headerTexts[i];
    }
}
populateColorHeaders();