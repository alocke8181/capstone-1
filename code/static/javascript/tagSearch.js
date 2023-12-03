let tagList;
const tagSearchBar = $('#tag-search');
let sugList = $('#suggestions');
const noResult = 'No Tags Found!';
let addedTags = $('#added-tags');

async function getTags(){
    let response = await axios.get(`${BASE_URL}/tags`);
    tagList = response.data.tags;
};
getTags();

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

tagSearchBar.on('keyup', tagSearchHandler)