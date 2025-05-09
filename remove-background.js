const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 設定輸入和輸出檔案路徑
const INPUT_VIDEO = './new.mov';
const OUTPUT_WEBM = './output333.webm';  // 網頁用
const OUTPUT_MOV = './output333.mov';    // 剪輯用

// 確保輸入檔案存在
function checkInputFile() {
    if (!fs.existsSync(INPUT_VIDEO)) {
        console.error('找不到輸入檔案：', INPUT_VIDEO);
        process.exit(1);
    }
}

// 處理 WebM 格式（VP9 + alpha）
async function processWebM() {
    console.log('開始處理 WebM 格式...');
    const ffmpegCmd = `ffmpeg -i "${INPUT_VIDEO}" `
        + `-c:v libvpx-vp9 `           // 使用 VP9 編碼
        + `-pix_fmt yuva420p `         // 支援 alpha 通道的像素格式
        + `-lossless 1 `               // 無損壓縮
        + `-quality good `             // 品質設定
        + `-cpu-used 0 `              // 最高品質壓縮
        + `-b:v 2M `                  // 視訊位元率
        + `-auto-alt-ref 0 `          // 禁用自動參考幀
        + `"${OUTPUT_WEBM}" -y`;      // 輸出檔案

    try {
        execSync(ffmpegCmd, { stdio: 'inherit' });
        console.log('WebM 格式處理完成！');
    } catch (error) {
        console.error('處理 WebM 時發生錯誤:', error);
    }
}

// 處理 MOV 格式（ProRes 4444）
async function processMOV() {
    console.log('開始處理 MOV 格式...');
    const ffmpegCmd = `ffmpeg -i "${INPUT_VIDEO}" `
        + `-c:v prores_ks `           // 使用 ProRes 編碼
        + `-profile:v 4444 `          // 使用 4444 配置（支援 alpha）
        + `-pix_fmt yuva444p10le `    // 支援 alpha 通道的像素格式
        + `"${OUTPUT_MOV}" -y`;       // 輸出檔案

    try {
        execSync(ffmpegCmd, { stdio: 'inherit' });
        console.log('MOV 格式處理完成！');
    } catch (error) {
        console.error('處理 MOV 時發生錯誤:', error);
    }
}

// 主要處理函數
async function processVideo() {
    try {
        // 檢查輸入檔案
        checkInputFile();

        // 處理兩種格式
        await processWebM();
        await processMOV();

        console.log('\n所有處理完成！');
        console.log('輸出檔案：');
        console.log('- WebM 格式（網頁用）:', OUTPUT_WEBM);
        console.log('- MOV 格式（剪輯用）:', OUTPUT_MOV);

    } catch (error) {
        console.error('處理時發生錯誤:', error);
    }
}

// 執行程式
processVideo(); 