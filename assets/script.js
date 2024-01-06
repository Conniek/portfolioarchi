const api_works = "http://localhost:5678/api/works";
const token = localStorage.getItem("jwt");

async function getWorksfromAPI(div, modale) {
    const URLAPIwork = await fetch(api_works);
    const AllWorks = await URLAPIwork.json();
    const uniqueCategories = new Set();

    AllWorks.forEach(work => { 
        const image = work.imageUrl;
        const title = work.title;
        const category = work.category.name;
        const imageId = work.id;

        document.getElementById(div).innerHTML += `
        <figure name="${category}" id="work_${imageId}">
				<img src="${image}" alt="${title}" >
				<figcaption>${title}</figcaption>
                <a href="#" class="delete" id="${imageId}">delete</a>
		</figure>
        `;
    });

    AllWorks.forEach(work => {
        uniqueCategories.add(work.category.name);
    });

// Si on clique sur delete pour supprimer un travail 
const buttonDeleteList = document.querySelectorAll('.delete');

buttonDeleteList.forEach(buttonDelete => {
    buttonDelete.addEventListener("click", () => {
        const workId = buttonDelete.parentElement.id.split('_').pop();
        deleteWork(workId);
        
    });
});

    if (!modale) {
        getCategoriesfromAPI(uniqueCategories)
    } 
}

async function getCategoriesfromAPI(array) {
    let allButton = document.createElement("input");
    allButton.type = "submit";
    allButton.value = "Tous";
    allButton.classList.add("bodyButton");
    document.getElementById("filters").appendChild(allButton);

    array.forEach(category => {
        let bodyButton = `<input type="submit" value="${category}" class="bodyButton">`;
        let filterButton = document.getElementById("filters");
        filterButton.innerHTML += bodyButton; 
    })

    filterByCategory();
}

async function filterByCategory() {
    let CategoryButtons = document.querySelectorAll(".bodyButton");

    CategoryButtons.forEach(buttonCategory => {
        buttonCategory.addEventListener("click", function () {
            const buttonCategoryValue = buttonCategory.getAttribute("value");
            const galleryItems = document.querySelectorAll(".gallery figure");
            const filteredGalleryItems = Array.from(galleryItems).filter(item => {
                return item.getAttribute("name") === buttonCategoryValue;
            });

            galleryItems.forEach(item => {
                if (filteredGalleryItems.includes(item) || buttonCategoryValue === "Tous") {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });
}

getWorksfromAPI("gallery", false);

// Gestion de login / logout 
let logout = document.getElementById("log");
if (token == null) {
    logout.innerHTML = "login"
} else {
    logout.innerHTML = "logout"
}

// Gestion du bouton modifier 
let spanOut = document.getElementById("modifier");
spanOut.innerHTML += `<i class="fa-solid fa-pen-to-square"></i> Modifier`;

if (token == null) {
    spanOut.style.visibility = 'hidden'
} else {
    spanOut.style.visibility = 'visible'
}

// Gestion de la modale 
let modal = document.getElementById("myModal");
let btn = document.getElementById("modifier");
let span = document.getElementById("close");

btn.addEventListener("click", fonctionModale => {
    modal.style.display = "block";
    const galleryModale = document.getElementById('galleryModale');
    if (galleryModale.childNodes.length === 0) {
        getWorksfromAPI("galleryModale", true)
    }
})
span.addEventListener("click", fonctionModale => {
    modal.style.display = "none";
})
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

//Si on clique sur "ajouter une photo" Modale 1 hidden et Modale 2 display
let ajouterPhoto = document.getElementById("ajouterPhoto");
let addPhoto = document.getElementById("add_photo");
let modal1 = document.getElementById("modal1")
addPhoto.addEventListener("click", fonctionModale2 => {
    ajouterPhoto.style.display = "block";
    modal1.style.display = "none";
    console.log("ajout")
})

//Si on clique sur la flèche retour, Modale 1 display et Modale 2 hidden
let btnRetour = document.getElementById("btnRetour");
btnRetour.addEventListener("click", retourModale1 => {
    ajouterPhoto.style.display = "none";
    modal1.style.display = "block";
})


// fonction d'ajout d'un nouveau fichier 
async function addWork() {
    const imageInput = document.getElementById('image');
    const imageFile = imageInput.files[0];
  
    const titreInput = document.getElementById('title');
    const titre = titreInput.value;
  
    const categoryInput = document.getElementById('category');
    const categoryId = categoryInput.value;
  
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', titre);
    formData.append('category', categoryId);

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formData 
    };
  
    try {
      const response = await fetch(api_works, requestOptions);
      if (response.ok) {
        const responseData = await response.json();
        console.log('Travail ajouté avec succès :', responseData);
      } else {
        console.error('Erreur lors de l\'ajout du travail. Code de réponse :', response.status);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la requête :', error);
    }
}

// Si on clique sur valider pour ajouter un nouveau travail 
const form = document.getElementById('media_form');
form.addEventListener("submit", function (event) {
    addWork();
   event.preventDefault();
})


async function deleteWork(workId) {
    // Envoyez une requête DELETE à l'API pour supprimer le travail avec l'ID spécifié
    const deleteUrl = `${api_works}/${workId}`;
    
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + token);

    const requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
    };

    try {
        const response = await fetch(deleteUrl, requestOptions);
        if (response.ok) {
            console.log('Travail supprimé avec succès.');
            // Maintenant, supprimez le travail du DOM
            const workElement = document.getElementById(`work_${workId}`);
            if (workElement) {
                workElement.remove();
            } else {
                console.error('Élément DOM introuvable pour le travail ID:', workId);
            }
        } else {
            console.error('Erreur lors de la suppression du travail. Code de réponse :', response.status);
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la requête de suppression :', error);
    }
}









