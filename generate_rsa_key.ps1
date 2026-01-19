$KeyPath = "$PSScriptRoot\donweb_rsa"
Write-Host "Generando clave RSA clásica en: $KeyPath"
ssh-keygen -t rsa -b 4096 -f $KeyPath -N "" -q
if (Test-Path "$KeyPath.pub") {
    Write-Host "`n=== COPIA ESTA CLAVE PÚBLICA (RSA) ===`n" -ForegroundColor Green
    Get-Content "$KeyPath.pub"
    Write-Host "`n======================================`n"
}
else {
    Write-Host "Error generando la clave." -ForegroundColor Red
}
