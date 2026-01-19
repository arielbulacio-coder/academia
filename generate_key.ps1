$KeyPath = "$PSScriptRoot\donweb_key"
Write-Host "Generando clave SSH en: $KeyPath"
ssh-keygen -t ed25519 -f $KeyPath -N "" -q
if (Test-Path "$KeyPath.pub") {
    Write-Host "`n=== COPIA ESTA CLAVE PÚBLICA EN DONWEB ===`n" -ForegroundColor Green
    Get-Content "$KeyPath.pub"
    Write-Host "`n============================================`n"
}
else {
    Write-Host "Error generando la clave." -ForegroundColor Red
}
