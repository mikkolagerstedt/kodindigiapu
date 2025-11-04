# fix-local.ps1 - Korjaa polut + PAKOTA UTF-8 ILMAN BOM
Set-Location "$env:USERPROFILE\Desktop\kodindigiapu"

Write-Host "Korjataan KAIKKI .html-tiedostot paikalliseen testaukseen..." -ForegroundColor Green

Get-ChildItem "*.html" | ForEach-Object {
    $file = $_.Name
    Write-Host "Käsitellään: $file" -ForegroundColor Yellow
    
    $content = Get-Content $file -Raw -Encoding UTF8

    # VAIN SUHTEELLISET POLUT (ei https://)
    $content = $content -replace '="/css/', '="css/'
    $content = $content -replace '="/js/', '="js/'
    $content = $content -replace '="/images/', '="images/'
    $content = $content -replace '="/favicon-', '="favicon-'
    $content = $content -replace '="/apple-touch-icon\.png', '="apple-touch-icon.png'
    $content = $content -replace '="/site\.webmanifest', '="site.webmanifest'
    $content = $content -replace '="/safari-pinned-tab\.svg', '="safari-pinned-tab.svg'

    # PAKOTA UTF-8 ILMAN BOM
    [System.IO.File]::WriteAllText($file, $content, [System.Text.UTF8Encoding]::new($false))
}

Write-Host "`nVALMIS! Kaikki sivut korjattu UTF-8 (ilman BOM)." -ForegroundColor Green
Write-Host "Avaa mikä tahansa .html-tiedosto selaimella."
pause