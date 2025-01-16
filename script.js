document.addEventListener('DOMContentLoaded', () => {
    const wall = document.querySelector('.contributors-wall');
    const categoriesList = document.querySelector('.categories-list');
    const searchInput = document.querySelector('#search');
    const searchType = document.querySelector('#searchType');
    const contributorInfo = document.querySelector('#contributorInfo');
    const prevPageBtn = document.querySelector('#prevPage');
    const nextPageBtn = document.querySelector('#nextPage');
    const pageInfo = document.querySelector('#pageInfo');

    const REPOS_PER_PAGE = 5;
    const BATCH_SIZE = 100; // 每批加载100个
    let currentPage = 1;
    let currentCategory = 'all';
    let allCategories = [];
    let intersectionObserver;
    let loadMoreObserver;
    let allContributorsCache = []; // 缓存所有贡献者
    let currentIndex = 0; // 当前加载的索引
    let isLoading = false;

    // 初始化交叉观察器
    function initIntersectionObserver() {
        intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target.querySelector('img');
                    if (img && img.dataset.src) {
                        img.src = img.dataset.src;
                        delete img.dataset.src;
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        });
    }

    // 初始化加载更多观察器
    function initLoadMoreObserver() {
        loadMoreObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoading && currentIndex < allContributorsCache.length) {
                loadMoreContributors();
            }
        }, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        });
    }

    // 添加加载更多触发器
    function addLoadMoreTrigger() {
        const trigger = document.createElement('div');
        trigger.className = 'load-more-trigger';
        trigger.style.height = '20px';
        wall.appendChild(trigger);
        loadMoreObserver.observe(trigger);
    }

    // 加载更多贡献者
    async function loadMoreContributors() {
        if (isLoading || currentIndex >= allContributorsCache.length) return;
        
        isLoading = true;
        const fragment = document.createDocumentFragment();
        const endIndex = Math.min(currentIndex + BATCH_SIZE, allContributorsCache.length);
        
        for (let i = currentIndex; i < endIndex; i++) {
            fragment.appendChild(allContributorsCache[i]);
        }
        
        // 移除旧的触发器
        const oldTrigger = wall.querySelector('.load-more-trigger');
        if (oldTrigger) {
            oldTrigger.remove();
        }
        
        wall.appendChild(fragment);
        currentIndex = endIndex;
        
        // 如果还有更多数据，添加新的触发器
        if (currentIndex < allContributorsCache.length) {
            addLoadMoreTrigger();
        }
        
        isLoading = false;
    }

    // 获取排序后的仓库列表
    function getSortedRepos() {
        return Object.entries(contributorsData)
            .map(([name, contributors]) => ({
                name,
                count: contributors.length
            }))
            .sort((a, b) => b.count - a.count); // 按贡献者数量降序排序
    }

    // 创建分类标签
    function createCategories() {
        categoriesList.innerHTML = '';
        // 始终显示 "All" 选项
        const allCategory = document.createElement('div');
        allCategory.className = 'category';
        if (currentCategory === 'all') {
            allCategory.classList.add('active');
        }
        allCategory.textContent = 'All';
        allCategory.dataset.category = 'all';
        categoriesList.appendChild(allCategory);

        // 获取排序后的仓库列表
        const sortedRepos = getSortedRepos();
        allCategories = sortedRepos.map(repo => repo.name);

        // 显示当前页的仓库
        const startIdx = (currentPage - 1) * REPOS_PER_PAGE;
        const endIdx = startIdx + REPOS_PER_PAGE;
        const pageCategories = sortedRepos.slice(startIdx, endIdx);

        pageCategories.forEach(repo => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category';
            if (repo.name === currentCategory) {
                categoryElement.classList.add('active');
            }
            categoryElement.textContent = `${repo.name} (${repo.count})`;
            categoryElement.dataset.category = repo.name;
            categoryElement.title = `${repo.count} contributors`;
            categoriesList.appendChild(categoryElement);
        });

        updatePaginationControls();
    }

    // 更新分页控件
    function updatePaginationControls() {
        const totalPages = Math.ceil(allCategories.length / REPOS_PER_PAGE);
        pageInfo.textContent = `${currentPage}/${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;

        // 添加总数显示
        const totalContributors = Object.values(contributorsData)
            .reduce((sum, contributors) => sum + contributors.length, 0);
        const uniqueContributors = new Set(
            Object.values(contributorsData)
                .flat()
                .map(c => c.username)
        ).size;

        pageInfo.title = `Total: ${totalContributors} contributions, ${uniqueContributors} unique contributors`;
    }

    // 创建贡献者元素
    function createContributorElement(contributor, index, category) {
        const div = document.createElement('div');
        div.className = 'contributor';
        div.dataset.category = category;
        div.dataset.username = contributor.username;
        div.style.setProperty('--delay', (index % 20) * 0.1);

        const img = document.createElement('img');
        img.dataset.src = contributor.avatar;
        img.alt = contributor.username;
        img.loading = 'lazy';

        div.appendChild(img);
        intersectionObserver.observe(div);

        // 添加悬浮事件
        div.addEventListener('mouseenter', (e) => {
            showContributorInfo(contributor, e);
            wall.classList.add('dimmed');
        });

        div.addEventListener('mouseleave', () => {
            hideContributorInfo();
            wall.classList.remove('dimmed');
        });

        // 添加点击事件（仅用于跳转到个人主页）
        div.addEventListener('click', () => {
            if (contributor.profile) {
                window.open(contributor.profile, '_blank');
            }
        });

        return div;
    }

    // 显示贡献者详细信息
    function showContributorInfo(contributor, event) {
        const infoElement = document.querySelector('#contributorInfo');
        const avatar = infoElement.querySelector('.large-avatar');
        const name = infoElement.querySelector('.contributor-name');
        const followers = infoElement.querySelector('.followers');
        const following = infoElement.querySelector('.following');
        const stars = infoElement.querySelector('.stars');

        avatar.src = contributor.avatar;
        avatar.alt = contributor.username;
        name.textContent = `@${contributor.username}`;
        followers.textContent = contributor.followers;
        following.textContent = contributor.following;
        stars.textContent = contributor.stars;

        const rect = event.target.getBoundingClientRect();
        const infoWidth = 300;
        const infoHeight = 250;
        
        let left = rect.right + 20;
        let top = rect.top;

        if (left + infoWidth > window.innerWidth) {
            left = rect.left - infoWidth - 20;
        }

        if (top + infoHeight > window.innerHeight) {
            top = window.innerHeight - infoHeight - 20;
        }

        infoElement.style.left = `${left}px`;
        infoElement.style.top = `${top}px`;
        infoElement.style.transform = 'none';
        infoElement.classList.add('active');
    }

    // 隐藏贡献者详细信息
    function hideContributorInfo() {
        const infoElement = document.querySelector('#contributorInfo');
        infoElement.classList.remove('active');
    }

    // 准备贡献者数据
    function prepareContributors(filter = '') {
        const contributors = [];
        const searchLower = filter.toLowerCase();
        const isRepoSearch = searchType.value === 'repo';

        if (currentCategory === 'all') {
            const allContributors = new Map();
            Object.entries(contributorsData).forEach(([category, categoryContributors]) => {
                categoryContributors.forEach(contributor => {
                    if (!allContributors.has(contributor.username)) {
                        allContributors.set(contributor.username, {
                            ...contributor,
                            categories: [category]
                        });
                    } else {
                        allContributors.get(contributor.username).categories.push(category);
                    }
                });
            });

            allContributors.forEach((contributor, username) => {
                if (!filter || 
                    (isRepoSearch && contributor.categories.some(cat => cat.toLowerCase().includes(searchLower))) ||
                    (!isRepoSearch && username.toLowerCase().includes(searchLower))) {
                    contributors.push(createContributorElement(contributor, contributors.length, 'all'));
                }
            });
        } else {
            const categoryContributors = contributorsData[currentCategory] || [];
            categoryContributors.forEach((contributor, index) => {
                if (!filter || 
                    (isRepoSearch && currentCategory.toLowerCase().includes(searchLower)) ||
                    (!isRepoSearch && contributor.username.toLowerCase().includes(searchLower))) {
                    contributors.push(createContributorElement(contributor, index, currentCategory));
                }
            });
        }

        // 随机排序
        for (let i = contributors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [contributors[i], contributors[j]] = [contributors[j], contributors[i]];
        }

        return contributors;
    }

    // 渲染贡献者墙
    async function renderContributors(filter = '') {
        const startTime = performance.now();
        wall.innerHTML = '';
        currentIndex = 0;
        isLoading = false;

        // 准备所有贡献者数据
        allContributorsCache = prepareContributors(filter);
        console.log(`Prepared ${allContributorsCache.length} contributors`);

        // 加载第一批
        await loadMoreContributors();

        console.log(`Initial rendering completed in ${performance.now() - startTime}ms`);
    }

    // 初始化
    initIntersectionObserver();
    initLoadMoreObserver();
    createCategories();
    renderContributors();

    // 搜索功能
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderContributors(e.target.value);
        }, 300);
    });

    // 搜索类型切换
    searchType.addEventListener('change', () => {
        if (searchInput.value) {
            renderContributors(searchInput.value);
        }
    });

    // 分类切换
    categoriesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('category')) {
            document.querySelectorAll('.category').forEach(cat => cat.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderContributors(searchInput.value);
        }
    });

    // 分页控制 - 只影响仓库列表
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            const sortedRepos = getSortedRepos();
            const startIdx = (currentPage - 1) * REPOS_PER_PAGE;
            const pageCategories = sortedRepos.slice(startIdx, startIdx + REPOS_PER_PAGE);
            
            if (currentCategory !== 'all' && !pageCategories.find(repo => repo.name === currentCategory)) {
                currentCategory = 'all';
            }
            createCategories();
            renderContributors(searchInput.value);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allCategories.length / REPOS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            const sortedRepos = getSortedRepos();
            const startIdx = (currentPage - 1) * REPOS_PER_PAGE;
            const pageCategories = sortedRepos.slice(startIdx, startIdx + REPOS_PER_PAGE);
            
            if (currentCategory !== 'all' && !pageCategories.find(repo => repo.name === currentCategory)) {
                currentCategory = 'all';
            }
            createCategories();
            renderContributors(searchInput.value);
        }
    });

    // 优化滚动性能
    let scrollRAF;
    window.addEventListener('scroll', () => {
        if (scrollRAF) {
            cancelAnimationFrame(scrollRAF);
        }

        scrollRAF = requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const viewportHeight = window.innerHeight;
            const elements = document.elementsFromPoint(
                window.innerWidth / 2,
                viewportHeight / 2
            );
            
            elements.forEach(element => {
                if (element.classList.contains('contributor')) {
                    const rect = element.getBoundingClientRect();
                    const centerY = rect.top + rect.height / 2;
                    const distanceFromCenter = Math.abs(viewportHeight / 2 - centerY);
                    const parallaxAmount = Math.min(20, 20 * (1 - distanceFromCenter / (viewportHeight / 2)));
                    element.style.transform = `translateY(${-scrolled * 0.1}px) translateZ(${parallaxAmount}px)`;
                }
            });
        });
    });
}); 