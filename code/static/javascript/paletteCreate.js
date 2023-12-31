$('#field-div').hide();
$('#confirm-button').prop('disabled',true);

function populateColorHeaders(){
    //Helper function to populate the color headers
    let $colorHeaders = $('.color-header');
    const headerTexts = ['Main','Light Shade','Light Accent','Dark Shade','Dark Accent'];
    for (let i =0; i<5; i++){
        $colorHeaders.get(i).innerText = headerTexts[i];
    }
}
populateColorHeaders();

//Sets the model to default
$('#default').attr('selected','selected');

async function generatePalette(){
    //Gets the lock info, color data, and model and sends it to the server.
    let $genButton = $('#gen-button');
    $genButton.click(async function(event){
        event.preventDefault();
        let sendColors = [];
        let model = $('#models').val();
        console.log(model);
        let $locks = $('.lock');
        let i = 0;
        $locks.each(function(){
            if (this.checked){
                let $colorPicker = $('#color-section').find('input[type=color]')[i];
                let color = $colorPicker.value;
                sendColors.push(color);
                i++;
            }
            else{
                sendColors.push("N");
                i++;
            }
        })
        let recieveData = await axios.post(`${BASE_URL}/palettes/generate`, {colors : sendColors, model : model});
        let colors = Object.values(recieveData.data.colors).reverse();
        let j = 0;
        $locks.each(function(){
            let $colorPicker = $('#color-section').find('input[type=color]')[j];
            $colorPicker.value = colors[j];
            j++;
        })
    });
}
generatePalette();

function showSaveForm(){
    //Shows the save form when the first save button is clicked
    let $saveButton = $('#save-button');
    $saveButton.click(function(event){
        event.preventDefault();
        $('#field-div').show();
    });
}
showSaveForm();

function hideSaveForm(){
    //Hide the save form when the cancel button is clicked
    $('#cancel-button').click(function(event){
        event.preventDefault();
        $('#field-div').hide();
    });
}
hideSaveForm();

async function savePalette(){
    //Function to save the palette to the database and redirect to its page
    $('#confirm-button').click(async function(event){
        event.preventDefault();
        let colors = [];
        let $colorPickers = $('#color-section').find('input[type=color]').each(function(){
            let color = this.value;
            colors.push(color)
        });
        let nameIn = $('#name').val();
        let descIn = $('#desc').val();
        let tags = [];
        addedTags.find('button').each((idx, child) =>{
            tags.push($(child).attr('name'));
        });
        let response = await axios.post(`${BASE_URL}/palettes/save`, {name : nameIn, desc : descIn, colors : colors, tags : tags});
        let redirUrl = response.data.redir_url
        window.location.replace(`${BASE_URL}${redirUrl}`);
    });
}
savePalette();




