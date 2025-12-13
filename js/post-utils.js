/**
 * 博客文章页面通用工具
 * 功能：上一篇/下一篇导航、分类标签生成、相对路径计算
 */

// --- 生成分类标签 ---
function generateCategories(posts) {
    const categoriesContainer = document.getElementById('categories');
    
    // 如果没有数据，显示加载失败提示
    if (!posts || !Array.isArray(posts)) {
        console.warn('Posts data is invalid, categories not available');
        categoriesContainer.innerHTML = '<span style="color: #999;">分类加载中...</span>';
        return;
    }
    
    // 获取当前文件的路径
    const currentPath = window.location.pathname;
    const decodedPath = decodeURIComponent(currentPath);
    const fileName = decodedPath.split('/').pop().replace(/\.html$/, '');
    
    // 根据标题匹配当前文章
    const currentPost = posts.find(p => {
        // 尝试多种匹配方式
        return p.file === fileName || 
               p.file.includes(fileName) || 
               p.title === document.title ||
               p.title === document.querySelector('h1')?.textContent ||
               p.file.includes(fileName.replace(/-/g, '_')) ||
               p.file.includes(fileName.replace(/_/g, '-'));
    });
    
    if (currentPost && currentPost.category) {
        const categories = Array.isArray(currentPost.category) 
            ? currentPost.category 
            : [currentPost.category];
        
        categoriesContainer.innerHTML = categories
            .map(category => 
                `<a href="/?category=${encodeURIComponent(category)}" 
                     class="category-tag" 
                     title="查看所有${category}相关的文章">
                    ${category}
                </a>`
            )
            .join('');
    } else {
        console.warn('No categories found for current post');
        categoriesContainer.innerHTML = '<span style="color: #999;">暂无分类</span>';
    }
}

// --- 生成文章导航 ---
function generatePostNavigation(posts) {
    const navContainer = document.getElementById('post-nav');
    if (!navContainer) return;
    
    // 按日期排序
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 获取当前文件的完整相对路径
    const pathParts = decodeURIComponent(window.location.pathname).split('/');
    const currentFile = pathParts[pathParts.length - 1];
    const currentDir = pathParts[pathParts.length - 2];
    const currentFilePath = `${currentDir}/${currentFile}`;
    
    // 找到当前文章在列表中的位置
    const currentIndex = posts.findIndex(p => p.file === currentFilePath);

    if (currentIndex === -1) {
        navContainer.innerHTML = '';
        return;
    }

    // 计算上一篇和下一篇
    const prevPost = posts[currentIndex - 1]; // 上一篇 (Newer)
    const nextPost = posts[currentIndex + 1]; // 下一篇 (Older)

    navContainer.innerHTML = ''; // 清空加载文字

    // 生成上一篇链接
    if (prevPost) {
        const prevPath = getRelativePath(prevPost.file, currentDir);
        navContainer.innerHTML += `
                <div class="nav-prev">
                    <span class="nav-label">← 上一篇</span>
                    <a href="${prevPath}">${prevPost.title}</a>
                </div>
            `;
    } else {
        navContainer.innerHTML += `<div></div>`;
    }

    // 生成下一篇链接
    if (nextPost) {
        const nextPath = getRelativePath(nextPost.file, currentDir);
        navContainer.innerHTML += `
                <div class="nav-next">
                    <span class="nav-label">下一篇 →</span>
                    <a href="${nextPath}">${nextPost.title}</a>
                </div>
            `;
    }
}

// --- 计算相对路径 ---
function getRelativePath(targetFile, currentDir) {
    // 如果目标文件和当前文件在同一目录
    if (targetFile.startsWith(currentDir + '/')) {
        return targetFile.replace(currentDir + '/', '');
    }
    
    // 如果在不同目录，需要返回上级再进入目标目录
    return '../' + targetFile;
}

// --- 计算字数和阅读时间 ---
function calculateReadingStats() {
    const content = document.querySelector('.content');
    if (!content) return;
    
    // 获取纯文本内容
    const text = content.innerText || content.textContent;
    
    // 计算中文字符数（包括标点符号）
    const chineseChars = (text.match(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g) || []).length;
    
    // 计算英文单词数
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    
    // 总字数（中文按字符计，英文按单词计）
    const totalWordCount = chineseChars + englishWords;
    
    // 计算阅读时间（中文字符：300字/分钟，英文单词：200词/分钟）
    const chineseReadingTime = chineseChars / 300;
    const englishReadingTime = englishWords / 200;
    const totalReadingTime = Math.ceil(chineseReadingTime + englishReadingTime);
    
    // 更新显示
    updateReadingStatsDisplay(totalWordCount, totalReadingTime);
}

// --- 更新阅读统计显示 ---
function updateReadingStatsDisplay(wordCount, readingTime) {
    const wordCountElement = document.getElementById('word-count');
    const readingTimeElement = document.getElementById('reading-time');
    
    if (wordCountElement) {
        wordCountElement.textContent = `本文字数：${wordCount}字`;
    }
    
    if (readingTimeElement) {
        if (readingTime < 1) {
            readingTimeElement.textContent = '建议阅读时间：不足1分钟';
        } else {
            readingTimeElement.textContent = `建议阅读时间：${readingTime}分钟`;
        }
    }
}

// --- 初始化文章页面 ---
function initPostPage() {
    // 计算阅读统计
    calculateReadingStats();
    
    fetch('../posts.json')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(posts => {
            console.log('Posts loaded successfully:', posts);
            
            // 生成分类标签
            generateCategories(posts);
            
            // 生成文章导航
            generatePostNavigation(posts);
        })
        .catch(err => {
            console.error('文章页面初始化失败:', err);
            // 即使加载失败，也尝试生成分类标签
            generateCategories([]);
            generatePostNavigation([]);
        });
}

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', initPostPage);