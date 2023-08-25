function populateColorHeaders(){
    //Helper function to populate the color headers
    let $colorHeaders = $('.color-header');
    const headerTexts = ['Main Color','Light Color','Light Accent','Dark Color','Dark Accent'];
    for (let i =0; i<5; i++){
        $colorHeaders.get(i).innerText = headerTexts[i];
    }
}
populateColorHeaders();

function generatePalette(){
    //Gets the lock info and color data and sends it to the server.
    let sendData = [];
    let $genButton = $('#gen-button');
    $genButton.click(function(event){
        event.preventDefault();
        sendData = [];
        let $locks = $('.lock');
        let index = 0;
        $locks.each(function(){
            if (this.checked){
                let $colorPicker = $('#color-section').find('input[type=color]')[index];
                let color = $colorPicker.value;
                sendData.push(color);
                index++;
            }
            else{
                sendData.push("N");
                index++;
            }
        })
        console.log(sendData);
    });
}
generatePalette();