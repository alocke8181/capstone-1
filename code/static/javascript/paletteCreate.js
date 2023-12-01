//const BASE_URL = 'https://palette-place.onrender.com/';
const BASE_URL = 'http://127.0.0.1:5000/'
let tagList;
const tagSearchBar = $('#tag-search');
let sugList = $('#suggestions');
const noResult = 'No Tags Found!';
const addedTags = $('#added-tags');


async function getTags(){
    let response = await axios.get(`${BASE_URL}/tags`);
    tagList = response.data.tags;
};
getTags();

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

function searchTagList(str){
    let lower = str.toLowerCase();
    let results = tagList.filter(eachTag => eachTag.toLowerCase().includes(lower));
    if (results.length ==0){
        results.push(noResult);
    }if(results.length >5){
        results = results.slice(0,5);
    };
    return results;
};

function clearSuggestions(){
	if(sugList.children().length > 0){
		Array.from(sugList.children()).forEach(eachChild => eachChild.remove());
	};
};

function tagSearchHandler(e){
    clearSuggestions();
    let query = tagSearchBar.val();
    if(query !== ''){
        let tags = searchTagList(query);
        showSuggestions(tags,query);
    }else{
        tagSearchBar.val(tagSearchBar.defaultValue);
    };
};

function showSuggestions(tags, query){
    tags.forEach(eachTag =>{
        let sugg = $('<button>');
        if(eachTag !== noResult){
            sugg.html(boldSuggestion(eachTag, query));
            sugg.addClass('btn btn-secondary');
            sugg.on('mouseover', () => {
                sugg.addClass('btn-success');
                sugg.removeClass('btn-secondary');});
            sugg.on('mouseout', () => {
                sugg.addClass('btn-secondary');
                sugg.removeClass('btn-success');});  
            sugg.on('click', (e) => {
                e.preventDefault();
                addTag(eachTag);
            });
        }else{
            sugg.text(noResult);
            sugg.addClass('btn btn-danger');
            sugg.prop('disabled',true);
        };
        sugList.append(sugg);
    });
};


function addTag(tag){
    if(checkTagAlreadyAdded(tag)){
        return;
    }else{
    let newTag = $('<button>');
    newTag.attr('name', tag);
    newTag.attr('id', tag);
    newTag.addClass('btn btn-primary');
    newTag.on('mouseover', () => {
        newTag.addClass('btn-danger');
        newTag.removeClass('btn-primary');});
    newTag.on('mouseout', () => {
        newTag.addClass('btn-primary');
        newTag.removeClass('btn-danger');});    
    newTag.text(tag);
    newTag.on('click', (e) => {
        e.preventDefault();
        newTag.remove();
    });
    addedTags.append(newTag);
    tagSearchBar.val('');
    clearSuggestions();
}
};

function checkTagAlreadyAdded(tag){
    let added = false;
    if(addedTags.children().length >0){
        addedTags.children().each((idx, child) =>{
            if($(child).attr('id') == tag){
                added = true;
            };
        });
    };
    return added;
};

function boldSuggestion(tag, query){
    let tagLower = tag.toLowerCase();
    let queryLower = query.toLowerCase();
    let firstIdx = tagLower.indexOf(queryLower);
    let lastIdx = firstIdx + query.length;

    let firstStr = tag.slice(0,firstIdx);
    let boldStr = tag.slice(firstIdx, lastIdx);
    let lastStr = tag.slice(lastIdx);
    return firstStr + "<b>" + boldStr + "</b>" + lastStr;
};

async function savePalette(){
    //Function to save the palette to the database
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

function checkLengths(){
    let nameLen = $('#name').val().length;
    let descLen = $('#desc').val().length;
    if ((nameLen <= 20 && nameLen >=1) && (descLen <=200)){
        $('#confirm-button').prop('disabled',false);
    }else{
        $('#confirm-button').prop('disabled',true);
    };
};

function nameCounter(){
    let $charCount = $('#name-counter');
    let $inputField = $('#name');
    let len = $inputField.val().length;
    $charCount.text(`${len}/20`);
    if (len > 20 || len <=0){
        $charCount.css('color','red');
    } if (len <=20 && len >=1){
        $charCount.css('color','#E5EBEF');
    }
};
nameCounter();
$('#name').on('keyup', function(){
    nameCounter();
    checkLengths();
});

function descCounter(){
    let $charCount = $('#desc-counter');
    let $inputField = $('#desc');
    let len = $inputField.val().length;
    $charCount.text(`${len}/200`);
    if (len > 200){
        $charCount.css('color','red');
    } if (len <=200 && len >=1){
        $charCount.css('color','#E5EBEF');
    }
};

descCounter();
$('#desc').on('keyup', function(){
    descCounter();
    checkLengths();
});

tagSearchBar.on('keyup', tagSearchHandler)
