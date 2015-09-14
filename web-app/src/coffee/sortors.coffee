Graph = require './Graph'

module.exports =
    species:
        parser: ->
            metaboliteDict = new Object()
            for metabolite in @data.metabolites
                metaboliteDict[metabolite.id] = metabolite

            pushedMetabolites = new Array()

            # Loop through BARE data
            for reaction in @data.reactions
                for specie in reaction.species
                    if not @parsedData[specie]?
                        @parsedData[specie] = new Object()
                        @parsedData[specie].metabolites = new Array()
                        @parsedData[specie].reactions = new Array()

                    @parsedData[specie].reactions.push(reaction)

                    for metabolite of reaction.metabolites
                        if metabolite not in pushedMetabolites
                            pushedMetabolites.push(metabolite)
                            @parsedData[specie].metabolites.push(metaboliteDict[metabolite])

        sortor: ->
            for reaction of @reactions
                r = @reactions[reaction]

                for specie in r.species
                    if r.productCompartments.indexOf('e') isnt -1
                        # fix
                        g = new Graph(r.id, r.name)
                        g.outNeighbours['e'] = @graph.outNeighbours['e']
                        g.inNeighbours[specie] = @graph.outNeighbours[specie]
                        g.value = r
                        @graph.outNeighbours[specie].outNeighbours[r.id] = g

        compartmentor: ->
            sorter = 'species'

            mappings =
                iJO1366: 'E. coli'

            for metabolite of @metabolites
                m = @metabolites[metabolite]

                for specie in m[sorter]
                    if not @graph.outNeighbours[specie]?
                        @graph.outNeighbours[specie] = new Graph(specie, mappings[specie])

            @graph.outNeighbours['e'] = new Graph('e', 'extracellular')


    compartments:
        compartmentor: ->
            sorter = 'compartment'

            mappings =
                c: 'cytosol'
                p: 'periplasm'
                e: 'extracellular'

            for metabolite of @metabolites
                m = @metabolites[metabolite]
                # If current Metabolite's compartment is not a child of `graph`, add it
                if not @graph.outNeighbours[m[sorter]]?
                    # Create a new child with no outNeighbours or parents
                    @graph.outNeighbours[m[sorter]] = new Graph(@metabolites[metabolite][sorter], mappings[m[sorter]])

        sortor: ->
            for reaction of @reactions
                r = @reactions[reaction]

                for cpt in r.substrateCompartments
                    leaf = null
                    for _cpt in r.substrateCompartments
                        potentialLeaf = @graph.outNeighbours[_cpt].outNeighbours[r.id]
                        if potentialLeaf?
                            leaf = potentialLeaf

                    if not leaf?
                        leaf = new Graph(r.id)

                        leaf.value = r
                    leaf.inNeighbours[cpt] = @graph.outNeighbours[cpt]
                    @graph.outNeighbours[cpt].outNeighbours[r.id] = leaf

                for cpt in r.productCompartments
                    leaf = null
                    for _cpt in r.substrateCompartments
                        potentialLeaf = @graph.outNeighbours[_cpt].outNeighbours[r.id]
                        if potentialLeaf?
                            leaf = potentialLeaf

                    if not leaf?
                        leaf = new Graph(r.id)
                        leaf.value = r

                    leaf.outNeighbours[cpt] = @graph.outNeighbours[cpt]
                    @graph.outNeighbours[cpt].inNeighbours[leaf.id] = leaf

                if r.outNeighbours.length is 0 #outNeighbour is e to be augmented later
                    leaf.outNeighbours["e"] = @graph.outNeighbours["e"]
                    @graph.outNeighbours["e"].inNeighbours[leaf.id] = leaf
