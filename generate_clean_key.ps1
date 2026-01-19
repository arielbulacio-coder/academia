$KeyPath = "$PSScriptRoot\donweb_clean"
Write-Host "Generando clave RSA LIMPIA..."
# -C "donweb" pone un comentario simple y seguro
ssh-keygen -t rsa -b 2048 -f $KeyPath -N "" -C "donweb" -q
if (Test-Path "$KeyPath.pub") {
    Write-Host "`n=== COPIA ESTA CLAVE LIMPIA ===`n" -ForegroundColor Green
    Get-Content "$KeyPath.pub"
    Write-Host "`n===============================`n"
}
