
  function handleOwnerProfile(evt) {
    if (evt.target.innerText === "Mongalmoy Karmakar") {
      openPopup1();
    } else if (evt.target.innerText === "Souvik Sarkhel") {
      openPopup2();
    }
  }


  function showAccPageRemoveUploadButton() {
    const element = document.getElementById("account-page-dp-upload-remove");
    if(element.style.display==="block"){
      element.style.display="none";
    } else {
      element.style.display="block";
    }
  }

  function removeAccPageRemoveUploadButton() {
    document.getElementById("account-page-dp-upload-remove").style.display="none";
  }


  function openPopup1() {
    const element = document.getElementById('mongalmoyProfile');
    if (element.style.display === "block") {
      element.style.display = "none";
    } else {
      element.style.display = "block";
    }
  }

  function closePopup1() {
    document.getElementById('mongalmoyProfile').style.display = "none";
  }

  function openPopup2() {
    const element = document.getElementById('souvikProfile');
    if (element.style.display === "block") {
      element.style.display = "none";
    } else {
      element.style.display = "block";
    }
  }

  function closePopup2() {
    document.getElementById('souvikProfile').style.display = "none";
  }

  function closePopup() {
    document.getElementById('mongalmoyProfile').style.display = "none";
    document.getElementById('souvikProfile').style.display = "none";
  }

  function openForm() {
    document.getElementById('openStartDiv').style.opacity = 0.2;
    document.getElementById('sendFormDiv').style.display = "block";
    document.getElementById('chatbox').style.opacity = 0.2;
  }

  function closeForm() {
    document.getElementById('openStartDiv').style.opacity = 1;
    document.getElementById('sendFormDiv').style.display = "none";
    document.getElementById('chatbox').style.opacity = 1;

    document.getElementById("emoji-icon-container").style.display="none";
    document.getElementById("attachIcons").style.display="none";

    document.getElementById("sendFormDivForm").action="/addpost";
  }



  function editAPost(editOptionsDivId, postContentId) {
    document.getElementById("openStartDiv").style.opacity="0.2";
    document.getElementById("chatbox").style.opacity="0.2";
    document.getElementById(editOptionsDivId).style.display='none';
    const element = document.getElementById("sendFormDiv");
    element.style.display="block";
    document.getElementById("posttextarea").innerText = document.getElementById(postContentId).innerText;
    document.getElementById("sendFormDivForm").action="/editpost";
    document.getElementById("formPostIdCarrier").value=editOptionsDivId;
  }


  function deleteAPost(postId) {
    document.getElementById("sendFormDivForm").action="/deletepost";
    document.getElementById("formPostIdCarrier").value=postId;
    document.getElementById("sendFormDivForm").submit();
  }



  function handleInputTextChange() {
    const inputValue = document.getElementById("posttextarea").value;
    if (inputValue == "") {
      document.getElementById('sendButton').style.color = '#929292';
      document.getElementById('posttextarea').style.border="2px solid #fff";
    } else {
      document.getElementById('sendButton').style.color = '#0734fd';
      document.getElementById('posttextarea').style.border="2px solid #E0E0E0";
    }
  }


  function displayEdit(id) {
    const element = document.getElementById(id);
    if(element.style.display==="block"){
      element.style.display="none";
    } else {
      element.style.display="block";
    }
  }


  function handleClickOnLike(e) {
    // console.log(e);
  }


  function displayEditSection(e) {

  }


  function manageEditLinks(e) {
    const elements = document.querySelectorAll(".account-page-heading-list ul li a");
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
      elements[i].attributes[2].value = "false";
      elements[i].attributes[3].value = "-1";
    }
    e.target.classList.add('active');
    e.srcElement.attributes[2].value = "true";
    e.srcElement.attributes[3].value = "0";

    // console.log(e.srcElement.attributes[3].value = "0");

    displayEditSection(e);
  }


  function manageUserChatBoxMargin() {
    const elements = document.querySelectorAll(".user-chatbox");
    for(let i=0;i<elements.length;i++){
      if(elements[i].innerText===""){
        elements[i].style.margin="0";
        elements[i].style.padding="0";
      } else{
        elements[i].style.margin="0 12px";
        elements[i].style.padding="5px";
      }
    }
  }
  manageUserChatBoxMargin() 


  function manageDeptLinks(e) {
    const btns = document.querySelectorAll(".jolutree-btn-grp__item");
    console.log(btns);
    for(let i=0;i<btns.length;i++){
      console.log(btns[i]);
      btns[i].classList.remove('active');
    }
    e.target.attributes.add('active');
    console.log(e.target.attributes);
  }


  function displayCommentSection(event) {
    let feedElements = document.querySelectorAll(".feed");
    feedElements.forEach(function (element) {
      if (element === event.path[2] || element === event.path[3]) {
        // console.log(element.style.height);
        if (element.style.height === "260px") {
          element.style.height = "210px";
          element.classList.remove("active");
        } else {
          element.style.height = "260px";
          element.classList.add("active");
        }
      }
    });

  }


  function dispalyAttachIcons() {
    document.getElementById("emoji-icon-container").style.display="none";

    let element = document.getElementById("attachIcons");

    if (element.style.display === "block") {
      element.style.display = "none";
    } else {
      element.style.display = "block";
    }
  }

  function handleCaptureButton() {
    document.getElementById('capture').style.display = "block";
  }

  function handleAttachImage() {
    document.querySelectorAll('.input-file')[0].click();
  }

  function handleAttachDocument() {
    document.querySelectorAll('.input-file')[1].click();
  }

  function handleAttachAudio() {
    document.querySelectorAll('.input-file')[2].click();
  }


  const cameraButton = document.getElementById('start-camera');
  const video = document.getElementById('video');
  const capture = document.getElementById('capture');
  const canvas = document.getElementById('canvas');

  cameraButton.addEventListener('click', async function () {
    try {
      const videoSrc = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 380,
          height: 280
        }
      });
      video.srcObject = videoSrc;
    } catch (e) {
      console.log(e.toString());
    }

    const context = canvas.getContext('2d');
    capture.addEventListener('click', function () {
      context.drawImage(video, 0, 0, 380, 280);
      // console.log('hii');
      // const imgUrlData = canvas.toDataUrl(images/jpeg);

      // console.log(imgUrlData);
    });

  });



  function displayCoverEditPopup() {
    const element = document.getElementById('coverEditPopup');

    if (element.style.display === "block") {
      element.style.display = "none";
    } else {
      element.style.display = "block";
    }
  }



  function removeCoverEditPopup() {
    document.getElementById('coverEditPopup').style.display = "none";
  }


  function inputCoverPhoto() {
    const element = document.getElementById('inputUserCoverPhoto');
    element.click();
  }



  function showDeleteAcountAlert(e) {
    const element=document.getElementById('delete-account-div');
    const accountPage=document.querySelector('.account-page-edit-container');
    
    element.style.display="block";
    accountPage.style.opacity="0.2";
  }


  function hideDeleteAcountAlert() {
    const element=document.getElementById('delete-account-div');
    const accountPage=document.querySelector('.account-page-edit-container');

    element.style.display="none";
    accountPage.style.opacity="1";
  }


  function displayAllEmojies() {
    document.getElementById("attachIcons").style.display="none";

    const element = document.getElementById("emoji-icon-container");
    if(element.style.display==="block") {
      element.style.display="none";
    } else {
      element.style.display="block";
    }
  }


  function appendEmojiToTextarea(event) {
    document.getElementById("posttextarea").value+=event.srcElement.innerText;
    handleInputTextChange();
  }
