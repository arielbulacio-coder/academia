$args = @("-t", "rsa", "-b", "2048", "-f", "donweb_fix", "-N", '""', "-C", "donweb")
& ssh-keygen $args
