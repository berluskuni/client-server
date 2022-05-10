(() => {
    let listGroup = document.getElementById('postLists');
    let listTab = document.getElementById('list-tab');
    let contentTab = document.getElementById('nav-tabContent')

    function renderPostLists(data) {
        // console.log(element);
        listGroup.innerHTML = '';
        data.forEach(element => {
            let a = document.createElement('a');
            a.setAttribute('href', `post.html?id=${element.id}`);
            a.setAttribute('class', 'list__link list-group-item list-group-item-action');
            a.innerText = element.title
            listGroup.appendChild(a);
        });

    }

    function updateURL(search) {
        if (history.pushState) {
            var baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            var newUrl = baseUrl + search;
            history.pushState(null, null, newUrl);
        } else {
            console.warn('History API не поддерживает ваш браузер');
        }
    }

    function renderPostDetail(data) {
        let postTitle = document.getElementById('postTitle');
        postTitle.innerHTML = data.title;
        let postBody = document.getElementById('postBody');
        postBody.innerHTML = data.body
    }

    function renderPostComment(data) {
        data.forEach(function(element, i) {
            let a = document.createElement('a');
            let div = document.createElement('div');

            a.setAttribute('id', `comment-${element.id}-list`);
            if (i === 0) {
                a.setAttribute('class', 'list-group-item list-group-item-action active');
                div.setAttribute('class', 'tab-pane fade show active')
            } else {
                a.setAttribute('class', 'list-group-item list-group-item-action');
                div.setAttribute('class', 'tab-pane fade')
            }

            a.setAttribute('href', `#comment-${element.id}`);
            a.setAttribute('data-toggle', 'list');
            a.setAttribute('aria-controls', `comment-${element.id}`);
            a.innerText = element.name;
            div.setAttribute('id', `comment-${element.id}`);
            div.setAttribute('role', 'tabpanel');
            div.setAttribute('aria-labelledby', `comment-${element.id}-list`);
            div.innerHTML = element.body;
            listTab.appendChild(a);
            contentTab.appendChild(div)
        });

    }

    async function loadPostDetail(e) {
        const pageParams = new URLSearchParams(window.location.search);
        let id = pageParams.get('id');
        const respPost = await fetch(`https://gorest.co.in/public-api/posts/${id}`)
        const dataPostJson = await respPost.json()
        const respPostComment = await fetch(`https://gorest.co.in/public-api/comments?post_id=${id}`)
        const dataPostComment = await respPostComment.json();
        renderPostDetail(dataPostJson.data);
        renderPostComment(dataPostComment.data);

    }
    async function loadsPosts(search = '') {
        updateURL(search);
        const response = await fetch(`https://gorest.co.in/public-api/posts${search}`);
        const dataJson = await response.json();
        renderPostLists(dataJson.data)
        init(dataJson.meta.pagination);

    }
    let pagePagination = {
        code: '',
        Extend: function(data) {
            data = data || {};
            pagePagination.size = data.size || 300;
            pagePagination.page = data.page || 1;
            pagePagination.step = data.step || 3;
        },
        Add: function(p, q) {
            for (let l = p; l < q; l++) {
                if (l === 1) {
                    pagePagination.code += `<a href="index.html">${l}</a>`;
                } else {
                    pagePagination.code += `<a href="index.html?page=${l}">${l}</a>`;
                }

            }
        },
        Last: function() {
            pagePagination.code += `<i>...</i><a href="index.html?page=${pagePagination.size}">${pagePagination.size}</a>`;
        },
        First: function() {
            pagePagination.code += `<a href="index.html">1</a><i>...</i>`;
        },
        Click: function(e) {
            e.preventDefault();
            // pagePagination.page = +this.innerHTML;
            // pagePagination.Start();
            loadsPosts(this.search);
        },
        Prev: function() {
            pagePagination.page--;
            if (pagePagination.page < 1) {
                pagePagination.page = 1
            }
            // pagePagination.Start();
            loadsPosts(`?page=${pagePagination.page}`);
        },
        Next: function() {
            pagePagination.page++;
            if (pagePagination.page > pagePagination.size) {
                pagePagination.page = pagePagination.size
            }
            // pagePagination.Start();
            loadsPosts(`?page=${pagePagination.page}`);
        },
        Bind: function() {
            let a = pagePagination.e.childNodes;
            for (let num = 0; num < a.length; num++) {
                if (+a[num].innerHTML === pagePagination.page) {
                    a[num].className = 'current';
                }
                a[num].addEventListener('click', pagePagination.Click, false);
            }
        },
        Finish: function() {
            pagePagination.e.innerHTML = pagePagination.code;
            pagePagination.code = '';
            pagePagination.Bind();
        },
        Start: function() {
            if (pagePagination.size < pagePagination.step * 2 + 6) {
                pagePagination.Add(1, pagePagination.size + 1);
            } else if (pagePagination.page < pagePagination.step * 2 + 1) {
                pagePagination.Add(1, pagePagination.step * 2 + 4);
                pagePagination.Last();
            } else if (pagePagination.page > pagePagination.size - pagePagination.step * 2) {
                pagePagination.First();
                pagePagination.Add(pagePagination.size - pagePagination.step * 2 - 2, pagePagination.size + 1);
            } else {
                pagePagination.First();
                pagePagination.Add(pagePagination.page - pagePagination.step, pagePagination.page + pagePagination.step + 1);
                pagePagination.Last()
            }
            pagePagination.Finish()
        },
        Buttons: function(e) {
            let nav = e.childNodes;
            nav[0].addEventListener('click', pagePagination.Prev, false);
            nav[2].addEventListener('click', pagePagination.Next, false);
        },
        Create: function(e) {
            let html = ['<a>◄</a>', // previous button
                '<span></span>', // paginationID container
                '<a>►</a>'
            ];
            e.innerHTML = html.join('');
            pagePagination.e = e.childNodes[1];
            pagePagination.Buttons(e);
        },
        Init: function(e, data) {
            pagePagination.Extend(data);
            pagePagination.Create(e);
            pagePagination.Start();
        }
    }
    let init = function(data) {
        pagePagination.Init(document.getElementById('paginationID'), {
            size: data.pages,
            page: data.page,
            step: 2
        })
    }
    document.addEventListener("DOMContentLoaded", () => {
        let arrLocation = window.location.toString().split('/')
        if (arrLocation[arrLocation.length - 1] === 'index.html' || arrLocation[arrLocation.length - 1] === '') {
            loadsPosts();
        } else {
            loadPostDetail();
        }

    });
})();
