$args = @("-t", "rsa", "-b", "2048", "-f", "donweb_nocomment", "-N", '""', "-C", "")
& ssh-keygen $args
