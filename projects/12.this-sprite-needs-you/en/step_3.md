## Build and test

Now it's time to make your project. Start small, and add more to your project if you have time.

![](images/step3_image.png)

**Tip:** Remember to test your project each time you add something. It is much easier to find and fix bugs before you make more changes.

--- task ---

You will need to decide in what order to build your project. You could:

+ Create one variable and allow the user to control it. Add animations, costumes, sound, effects, and conversation to make the sprite really come to life 
+ Create multiple variables with simple ways for the user to control them, and then add more effects later

Adding a sprite and then creating a `variable`{:class="block3variables"} is a great start.

--- /task ---

You have built up some really useful skills. Here is a reminder to help you make your project: 

### Using variables

```blocks3
set [my variable v] to (0)
```

[[[scratch3-create-set-variable]]]

[[[scratch3-set-variable-with-button]]]

[[[scratch3-change-variable-in-loop]]]

### Checking conditions

```blocks3
if <(my variable) = (0)> then
```

[[[scratch3-forever-condition]]]

[[[scratch3-operators-conditions]]]

[[[scratch3-if-then-else]]]

[[[scratch3-set-block-input-colour-with-eyedropper]]]

### Broadcasting and receiving messages

```blocks3
broadcast (message1 v)
```

[[[generic-scratch3-broadcast-message]]]

### Working with text:

```blocks3
say (join[Hello ](name)) for (2) seconds
```

[[[scratch3-emoji-text]]]

[[[scratch3-ask-answer-chat]]]

[[[scratch3-join-text]]]

### Backdrops, movement, and graphic effects

```blocks3
set [ghost v] effect to (0)
```

[[[scratch3-glide-to-object]]]

[[[scratch3-changing-backdrops-pages-levels]]]

[[[scratch3-change-costumes-to-show-mood]]]

[[[scratch3-animate-movement-costumes]]]

[[[scratch3-graphic-effects]]]

[[[scratch3-show-hide-sprites-backdrops]]]

[[[scratch3-positioning-with-layers]]]

[[[scratch3-jiggle-a-sprite]]]

### Sound:

```blocks3
start sound (Pop v)
```

[[[scratch3-add-sound]]]

[[[scratch3-record-sound]]]

[[[scratch3-text-to-speech]]]

### Paint editor — backdrops and costumes

[[[scratch3-paint-a-new-backdrop-extended]]]

[[[scratch3-backdrops-and-sprites-using-shapes]]]

[[[scratch3-use-text-tool]]]

[[[scratch3-copy-parts-between-sprite-costumes]]]

[[[scratch3-add-costumes-to-a-sprite]]]

### Scratch editor

[[[scratch3-copy-code]]]

[[[scratch3-full-screen]]]

[[[scratch3-duplicate-sprite]]]

[[[scratch-backpack]]]


--- task ---

**Test:** Show someone else your project and get their feedback. Do you want to make any changes to your game? 

--- /task ---

--- task ---

**Debug:** You might find some bugs in your project that you need to fix. Here are some common bugs.


--- collapse ---

---
title: Variables aren't updating correctly
---

One common mistake is to confuse the `change`{:class="block3variables"} and `set`{:class="block3variables"} blocks. 

+ `set`{:class="block3variables"} replaces the value of a variable with a new value.
+ `change`{:class="block3variables"} adds a number to a variable. If you `change by`{:class="block3variables"} a positive number, the variable value gets bigger. If you `change by`{:class="block3variables"} a negative number, then variable value gets smaller.


Another common problem is typing the name of a variable instead of dragging the variable from the `Variables`{:class="block3variables"} blocks menu. Variables should be orange:

```blocks3
say (name) for (2) seconds
```

**not**:

```blocks3
say [name] for (2) seconds
```

--- /collapse ---

--- collapse ---

---
title: A change only happens once instead of forever
---

Make sure you have placed code blocks that need to keep running inside a `forever`{:class="block3control"} block. It's really common to forget to do this!

--- /collapse ---

--- collapse ---

---
title: Number comparisons conditions aren't working
---

Are you sure you have used the `>`{:class="block3operators"} (greater than) and `<`{:class="block3operators"} (less than) operators the right way around?

```blocks3
<(health) > (0)> // means the health variable must be bigger than 0
<(health) < (5)> // means the health variable must be smaller than 5
```

**Tip:** The number that must be bigger goes on the wider (bigger) side of the operator symbol.

--- /collapse ---

--- collapse ---

---
title: Nothing happens when I broadcast a message
---

Make sure you have a matching `when I receive`{:class="block3events"} block that does something when you `broadcast`{:class="block3events"} a message. Check that the message names match.

--- /collapse ---

You might find a bug not listed here. Can you figure out how to fix it?

If you get stuck, try reading your code out loud or explaining the problem to a friend. You might spot the problem. 

We love hearing about your bugs and how you fixed them. Use the feedback button at the bottom of this page if you found a different bug in your project.

--- /task ---


--- save ---

