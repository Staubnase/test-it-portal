if((Get-Service CacheBuilder).Status -ne "Running" -and (Get-Service CacheBuilder).Status -ne "StartPending")
{
    Start-Service CacheBuilder
}