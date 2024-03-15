let nav = document.querySelector('.navbar')
let input = document.getElementsByClassName("input")[0].firstElementChild
let send = document.querySelector('.sendQuery')
let chatHistoryUl = document.querySelector(".chatHistoryUl")
let imgHisUl = document.querySelector('.imgHistoryUl')
let chatOn = document.querySelectorAll(".chatOn")
let chatoff = document.getElementsByClassName("default")[0]
let chatLive = document.querySelector('.chatLive')
let imageLive = document.getElementsByClassName('imageLive')[0]
let chatArea = document.getElementsByClassName('chatting')[0]
let newChat = document.getElementById('newChat')
let deleteAll = document.querySelector(".upperImg").firstElementChild
let mode = document.querySelectorAll('.mode')
let menu = document.querySelector('.menu')
let navigateLi = document.querySelectorAll('.navLi')
let data = []
let dataImage = []
const api_key = config.api_key

// Creating Cursor Typed Animation for Chat
let typedAnimationChat = () => {
  let options = {
    strings: ['Hi! How can I help you today ?.', 'Act as a Developer', 'Low Investment Business Ideas', 'Debug this code', "Best Free Food's APIs", 'Easy ways to earn money as a student.'],
    typeSpeed: 40,
    loop: true,
    backSpeed: 20,
    backDelay: 2300,
  };

  if (window.typed) {
    window.typed.destroy();
  }
  window.typed = new Typed("#span1", options);
}

// Creating Cursor Typed Animation for Image Generation
let typedAnimationImg = () => {
  let options = {
    strings: ['Generate your Imagination in seconds!', "A whimsical garden filled with oversized flowers", "Haunted mansion", "Alien marketplace", "Magical library", "A cozy cabin nestled in a snow-covered mountain valley."],
    typeSpeed: 40,
    loop: true,
    backSpeed: 20,
    backDelay: 2300,
  };

  if (window.typed) {
    window.typed.destroy();
  }
  window.typed = new Typed("#span1", options);
}

// Typed Animation until we get the Image response from API
let ImgGenWait = () => {
  let options = {
    strings: ['Generating...', '50% Done', '78% Done', 'Getting on Screen'],
    typeSpeed: 40,
    backSpeed: 20,
    backDelay: 2200,
  };

  if (window.typed) {
    window.typed.destroy();
  }
  window.typed = new Typed("#span1", options);
}

// Getting response from api -->> CHAT
async function getChat(prompt) {
  const url = 'https://api.openai.com/v1/chat/completions'
  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`
    },
    body: JSON.stringify({
      'model': 'gpt-3.5-turbo',
      'messages': [
        {
          'role': 'user',
          'content': `${prompt}`
        }
      ]
    })
  }

  input.value = ""
  const response = await fetch(url, options);
  const result = await response.json();

  return result.choices[0].message.content
}

// Getting response from api -->> IMAGE
async function getImage(prompt) {
  const url = 'https://api.openai.com/v1/images/generations';

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`
    },
    body: JSON.stringify({
      model: 'dall-e-2',
      prompt: `${prompt}`,
      n: 1,
      size: '1024x1024'
    })
  };

  input.value = ""
  const response = await fetch(url, options);
  const result = await response.json();

  return result.data[0].url
}

// Generate a title for chat history
async function generateTitle(prompt) {
  const apiUrl = 'https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions';
  const requestBody = {
    prompt: `Generate a small to the point title of this given paragaraph:- ${prompt}`,
    max_tokens: 20
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  const generatedTitle = data.choices[0].text.replaceAll('\n', " ").replace(/"/g, '').replace(':', "").trim();

  return generatedTitle;
}

// Stores Chat Data in local Storage as an object
let storeDataChat = (hisTitle, userQuery, response) => {
  let chatData = {
    'hisTitle': hisTitle,
    'user': userQuery,
    'gpt': response,
  }

  data.push(chatData)
  localStorage.setItem('chat', JSON.stringify(data))

  return true
}

// Stores Image Data in local Storage as an object
let storeDataImg = (userQuery, response) => {
  let imgData = {
    'user': userQuery,
    'gpt': response,
  }

  dataImage.push(imgData)
  localStorage.setItem('Image', JSON.stringify(dataImage))
  return true
}

// Event Handler of send Button which perform various actions -->> CHAT
async function chatHandler() {
  chatoff.classList.add('none')
  chatLive.classList.remove('none')
  let query = input.value
  chatLive.innerHTML += `<div class="chatOn">
    <div class="userIp flex">
        <div>
            <img src="images/person.png" alt="icon">
        </div>
        <div class="content">
            <div class="name">You</div>
            <div class="text">${query}</div>
        </div>
    </div>
    
    <div class="gptResponse flex">
        <div>
            <img src="images/chatOn.svg" alt="icon">
        </div>
        <div class="content">
            <div class="name">YashGPT</div>
            <div class="text">Thinking...</div>
        </div>
    </div>
</div>`

  chatArea.scrollTop = chatArea.scrollHeight; // Getting down to the page automatically

  let response = await getChat(query)
  let gptRes = Array.from(document.getElementsByClassName('gptResponse'))
  let lastElement = gptRes[gptRes.length - 1]
  let gptText = lastElement.querySelector(".text")
  gptText.innerText = response

  // Displaying Chat history dynamically with a brief title
  let hisTitle = await generateTitle(response)

  storeDataChat(hisTitle, query, response) // Stores Chat Data in local Storage

  let historyData = JSON.parse(localStorage.getItem('chat'))
  chatHistoryUl.innerHTML = '';

  // Create New Li On the basis of data stored in local Storage
  historyData.forEach((element) => {
    let li = document.createElement('li')
    let p = document.createElement('p')
    let img = document.createElement('img')
    img.setAttribute('src', 'images/deleteChat.svg')
    img.setAttribute('alt', 'delete all')
    p.innerHTML = element.hisTitle
    li.appendChild(p)
    li.appendChild(img)
    chatHistoryUl.appendChild(li)
  })

  // Attach an event listener to all history li's to show detailed chat
  let liArr = Array.from(chatHistoryUl.children)
  liArr.forEach((element, index) => {
    element.addEventListener('click', () => {
      chatLive.innerHTML = ''
      chatoff.classList.add('none')
      chatLive.classList.remove('none')
      chatLive.innerHTML = `<div class="chatOn">
         <div class="userIp flex">
             <div>
                 <img src="images/person.png" alt="icon">
             </div>
             <div class="content">
                 <div class="name">You</div>
                 <div class="text">${data[index].user}</div>
             </div>
         </div>
         
         <div class="gptResponse flex">
             <div>
                 <img src="images/chatOn.svg" alt="icon">
             </div>
             <div class="content">
                 <div class="name">YashGPT</div>
                 <div class="text"></div>
             </div>
         </div>
     </div>`
      let gptRes = document.getElementsByClassName('gptResponse')[0]
      let gptText = gptRes.querySelector(".text")
      gptText.innerText = data[index].gpt
    })

    // Attach an event Listener to delete Chat button To Delete Chat Permanently from local Storage and update it
    element.lastElementChild.addEventListener('click', (e) => {
      data.splice(index, 1);
      // Updating local Storage after Deleting the chat
      localStorage.setItem('chat', JSON.stringify(data));
      element.remove()
      e.stopPropagation()
      location.reload()
    })
  })

}

// Event Handler of send Button which perform various actions -->> IMAGE
async function imgHandler() {
  let query = input.value
  imageLive.innerHTML = ''
  imageLive.classList.remove('none')
  chatoff.classList.remove('none')
  ImgGenWait() // Typed Animation until we get the Image response from API

  let generatedImg = await getImage(query)
  chatoff.classList.add('none')
  imageLive.innerHTML = ''
  imageLive.innerHTML = `<img src=${generatedImg} alt='generated Image'>`

  storeDataImg(query, generatedImg) // Stores Image Data in Local Storage

  let historyData = JSON.parse(localStorage.getItem('Image'))
  imgHisUl.innerHTML = '';

  // Create New Li On the basis of data stored in local Storage
  historyData.forEach((element) => {
    let li = document.createElement('li')
    let p = document.createElement('p')
    let img = document.createElement('img')
    img.setAttribute('src', 'images/deleteChat.svg')
    img.setAttribute('alt', 'delete all')
    p.innerHTML = element.user
    li.appendChild(p)
    li.appendChild(img)
    imgHisUl.appendChild(li)
  })

  // Attach an event listener to all history li's to show Image
  let liArr = Array.from(imgHisUl.children)
  liArr.forEach((element, index) => {
    element.addEventListener('click', () => {
      imageLive.innerHTML = ''
      chatoff.classList.add('none')
      imageLive.classList.remove('none')
      imageLive.innerHTML = `<img src=${dataImage[index].gpt}>`
    })

    // Attach an event Listener to delete Img button To Delete Img Permanently from local Storage and update it
    element.lastElementChild.addEventListener('click', (e) => {
      dataImage.splice(index, 1);
      // Updating local Storage after Deleting the image
      localStorage.setItem('Image', JSON.stringify(dataImage));
      element.remove()
      e.stopPropagation()
      location.reload()
    })
  })
}

function enterChat(e) {
  if (e.key === 'Enter') {
    typed.stop();
    chatHandler()
  }
}

function enterImg(e) {
  if (e.key === 'Enter') {
    typed.stop();
    imgHandler()
  }
}

async function main() {

  // Initial call to start the animation on page load
  typedAnimationChat()

  // Attach an event listener to send button
  send.addEventListener('click', chatHandler)

  // Attach an event Listener to enter key to input element
  input.addEventListener('keydown', enterChat)

  // Showing send button only when user enter any message
  input.addEventListener('input', () => {
    if (input.value != "") {
      send.style.transform = 'translateX(0px)'
      send.style.visibility = 'visible'
    }
    else {
      send.style.transform = 'translateX(-100px)'
      send.style.visibility = 'hidden'
    }
  })

  // Attach an event listener to new chat button
  newChat.addEventListener('click', () => {
    input.value = ''
    if (chatoff.classList.contains('none')) {
      send.style.transform = 'translateX(-100px)'
      send.style.visibility = 'hidden'
      chatLive.innerHTML = ""
      chatLive.classList.add('none')
      imageLive.innerHTML = ""
      imageLive.classList.add('none')
      chatoff.classList.remove('none')
      if (nav.classList.contains('currentChat')) {
        typedAnimationChat()
      }
      else {
        typedAnimationImg()
      }
    }
  })

  // Attach an event listener to Delete All button
  deleteAll.addEventListener('click', () => {
    let ans = confirm("Are you sure to DELETE ALL chats Permanently")
    if (ans) {
      localStorage.clear()
      location.reload()
    }
  })

  // Handle to show chatHistory on Page load by getting data from local storage
  window.addEventListener('load', () => {
    let historyData = JSON.parse(localStorage.getItem('chat'))

    // Retrieve existing data from local storage, if any
    let existingData = localStorage.getItem('chat');
    data = existingData ? JSON.parse(existingData) : [];

    if (historyData) {
      chatHistoryUl.innerHTML = ''; // Clear existing content of chatHistoryUl

      // Create New Li On the basis of data stored in local Storage
      historyData.forEach((element) => {
        let li = document.createElement('li')
        let p = document.createElement('p')
        let img = document.createElement('img')
        img.setAttribute('src', 'images/deleteChat.svg')
        img.setAttribute('alt', 'delete all')
        img.classList.add('deleteChat')
        p.innerHTML = element.hisTitle
        li.appendChild(p)
        li.appendChild(img)
        chatHistoryUl.appendChild(li)
      })

      // Attach an event listener to all Chat history li's to show detailed chat
      let liArr = Array.from(chatHistoryUl.children)
      liArr.forEach((element, index) => {
        element.addEventListener('click', () => {
          chatLive.innerHTML = ''
          chatoff.classList.add('none')
          chatLive.classList.remove('none')
          chatLive.innerHTML = `<div class="chatOn">
          <div class="userIp flex">
              <div>
                  <img src="images/person.png" alt="icon">
              </div>
              <div class="content">
                  <div class="name">You</div>
                  <div class="text">${data[index].user}</div>
              </div>
          </div>
          
          <div class="gptResponse flex">
              <div>
                  <img src="images/chatOn.svg" alt="icon">
              </div>
              <div class="content">
                  <div class="name">YashGPT</div>
                  <div class="text"></div>
              </div>
           </div>
         </div>`
          let gptRes = document.getElementsByClassName('gptResponse')[0]
          let gptText = gptRes.querySelector(".text")
          gptText.innerText = data[index].gpt
        })

        // Attach an event Listener to Delete Chat button To Delete Chat Permanently from local Storage and update it
        element.lastElementChild.addEventListener('click', (e) => {
          data.splice(index, 1);
          // Updating local Storage after Deleting the chat
          localStorage.setItem('chat', JSON.stringify(data));
          element.remove()
          e.stopPropagation()
          location.reload()
        })
      })

      if (localStorage.getItem('current') == 'image') {
        navigateLi[1].style.boxShadow = '0px 5px 15px black'
        navigateLi[0].style.boxShadow = 'unset'

        send.removeEventListener('click', chatHandler)
        send.addEventListener('click', imgHandler)

        imageLive.innerHTML = ''
        chatLive.innerHTML = ''
        imageLive.classList.add('none')
        chatLive.classList.add('none')
        chatoff.classList.remove('none')

        chatHistoryUl.classList.add('none')
        imgHisUl.classList.remove('none')

        nav.classList.add('currentImage')
        nav.classList.remove('currentChat')
        typedAnimationImg()

        // Attach an event Listener to enter key to input element
        input.removeEventListener('keydown', enterChat)
        input.addEventListener('keydown', enterImg)
      }
      else {
        navigateLi[0].style.boxShadow = '0px 5px 15px black'
        navigateLi[1].style.boxShadow = 'unset'

        send.removeEventListener('click', imgHandler)
        send.addEventListener('click', chatHandler)

        imageLive.innerHTML = ''
        chatoff.classList.remove('none')
        imageLive.classList.add('none')

        chatHistoryUl.classList.remove('none')
        imgHisUl.classList.add('none')

        nav.classList.add('currentChat')
        nav.classList.remove('currentImage')
        typedAnimationChat()

        // Attach an event Listener for enter key to input element
        input.removeEventListener('keydown', enterImg)
        input.addEventListener('keydown', enterChat)
      }
    }

  });

  // Handle to show Image History on Page load by getting data from local storage
  window.addEventListener('load', () => {
    let historyData = JSON.parse(localStorage.getItem('Image'))

    // Retrieve existing data from local storage, if any
    let existingData = localStorage.getItem('Image');
    dataImage = existingData ? JSON.parse(existingData) : [];

    if (historyData) {
      imgHisUl.innerHTML = ''; // Clear existing content of ImageHistoryUl

      // Create New Li On the basis of data stored in local Storage
      historyData.forEach((element) => {
        let li = document.createElement('li')
        let p = document.createElement('p')
        let img = document.createElement('img')
        img.setAttribute('src', 'images/deleteChat.svg')
        img.setAttribute('alt', 'delete all')
        img.classList.add('deleteChat')
        p.innerHTML = element.user
        li.appendChild(p)
        li.appendChild(img)
        imgHisUl.appendChild(li)
      })

      // Attach an event listener to all history li's to show Image
      let liArr = Array.from(imgHisUl.children)
      liArr.forEach((element, index) => {
        element.addEventListener('click', () => {
          imageLive.innerHTML = ''
          chatoff.classList.add('none')
          imageLive.classList.remove('none')
          imageLive.innerHTML = `<img src=${dataImage[index].gpt}>`
        })

        // Attach an event Listener to delete Img button To Delete Img Permanently from local Storage and update it
        element.lastElementChild.addEventListener('click', (e) => {
          dataImage.splice(index, 1);
          // Updating local Storage after Deleting the image
          localStorage.setItem('Image', JSON.stringify(dataImage));
          element.remove()
          e.stopPropagation()
          location.reload()
        })
      })
    }

  })

  // Activate Dark/Light mode from Navbar and Menu(Responsive)
  for (const iterator of mode) {
    iterator.addEventListener('click', () => {
      let container = document.querySelector('.container')
      container.classList.toggle('dark')
    })
  }

  // Show Menu when clicked after media query applied
  menu.addEventListener('click', () => {
    let left = document.querySelector('.left')
    left.style.left = '0'
  })

  // Attach Event Listener to close menu Button
  let goBack = document.getElementById('back')
  goBack.addEventListener('click', () => {
    document.querySelector('.left').style.left = '-120%'
  })

  // Attach an Event Listener to nav Li's
  navigateLi[0].style.boxShadow = '0px 5px 15px black' // Default on chat
  for (const iterator of navigateLi) {
    iterator.addEventListener('click', () => {
      for (const iterator of navigateLi) {
        iterator.style.boxShadow = 'unset'
      }
      iterator.style.boxShadow = '0px 5px 15px black'
    })
  }

  // Adding Event Listeners to NavBar Li's to switch b/w chat & Image
  navigateLi[1].addEventListener('click', () => {
    localStorage.setItem("current", 'image'); // To store the user current Usage

    send.removeEventListener('click', chatHandler)
    send.addEventListener('click', imgHandler)

    imageLive.innerHTML = ''
    chatLive.innerHTML = ''
    imageLive.classList.add('none')
    chatLive.classList.add('none')
    chatoff.classList.remove('none')

    chatHistoryUl.classList.add('none')
    imgHisUl.classList.remove('none')

    nav.classList.add('currentImage')
    nav.classList.remove('currentChat')
    typedAnimationImg()
    // chatHistoryUl.style.pointerEvents = 'none'

    // Attach an event Listener to enter key to input element
    input.removeEventListener('keydown', enterChat)
    input.addEventListener('keydown', enterImg)
  })

  navigateLi[0].addEventListener('click', () => {
    localStorage.setItem("current", 'chat'); // To store the user current Usage

    send.removeEventListener('click', imgHandler)
    send.addEventListener('click', chatHandler)

    imageLive.innerHTML = ''
    chatoff.classList.remove('none')
    imageLive.classList.add('none')

    chatHistoryUl.classList.remove('none')
    imgHisUl.classList.add('none')

    nav.classList.add('currentChat')
    nav.classList.remove('currentImage')
    typedAnimationChat()

    // Attach an event Listener for enter key to input element
    input.removeEventListener('keydown', enterImg)
    input.addEventListener('keydown', enterChat)

  })

}


main()