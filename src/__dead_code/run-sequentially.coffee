  run: ->
     Progress through list of figures, print
     each one to file
     TODO: fix this mode of operation
     __runTask = (t)->
       console.log "#{t.code} ⇒ #{t.outfile}"
       p = generateFigure(t)

       if options.waitForUser
         p = p.then waitForUserInput
       p.then printFigureArea
         .catch (e)->console.log('Error: '+e)

     Promise
       .map @tasks, __runTask, concurrency: 1
