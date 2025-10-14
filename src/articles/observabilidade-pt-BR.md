---
title: "Observabilidade em .NET"
date: "2025-10-07"
tags: ["tecnologia", "iniciante"]
location: "Brasil"
---

## Introdução

Nos dias de hoje, tornou-se bastante comum ouvir os termos "sistemas distribuídos", "microsserviços" e "Kubernetes". Junto a esses termos vem a necessidade de monitorar esses serviços:

- Está ocorrendo erros? Quais? Onde ocorreu?
- Como está o consumo de CPU e de memória?
- Qual o tempo médio que uma solicitação demora para ser processada?

Essas e outras perguntas nos levam às questões: como monitorar esses serviços? Basta apenas monitorar ou precisamos de observabilidade?

Neste artigo iremos descobrir o que é observabilidade, por que ela é importante para sistemas distribuídos e como implementá-la em .NET.

## Conceitos Fundamentais

![Os três pilares da observabilidade: Logs, Métricas e Traces](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wx00w33jfge68u37c2w5.png)

A observabilidade é pautada em três pilares: logs, traces e métricas. Explicarei brevemente o que cada um desses significa.

**Logs** são mensagens detalhadas sobre eventos ocorridos na aplicação, geralmente em formato de texto estruturado (JSON) ou semiestruturado; são usadas para diagnosticar erros e entender o comportamento do sistema em momentos específicos. Podemos registrar erros ou eventos específicos com o tratamento de exceções adequado.

**Métricas** são valores numéricos coletados ao longo do tempo que representam o estado ou desempenho de um sistema (ex.: tempo médio de resposta, número de requisições por segundo, uso de memória, número de vendas, número de clientes cadastrados etc.).

**Rastreamentos (traces)** são registros encadeados que mostram o caminho de uma requisição através de múltiplos componentes ou serviços, permitindo identificar gargalos e dependências em arquiteturas distribuídas. Com esse pilar conseguimos entender toda a linha do tempo de uma requisição.

Os pilares se integram: as métricas respondem o que está acontecendo, o rastreamento nos diz onde está acontecendo e os logs explicam por que está acontecendo.

**detectar (métrica) → isolar (trace) → explicar (log).**

Agora que sabemos o que é observabilidade, o que são os pilares e como eles se relacionam, podemos partir para a implementação.

## Configurando observabilidade na prática — Logs

Começando pelos logs, usaremos a biblioteca Serilog para gerar logs de forma estruturada e enriquecida.

**Pré-requisitos:**

- [.NET 8](https://dotnet.microsoft.com/pt-br/)
- [Docker](https://docs.docker.com/build-cloud/)

Crie o projeto Web App em .NET 8 e adicione os pacotes abaixo para começarmos:

```
dotnet add package Serilog
dotnet add package Serilog.AspNetCore
```

No `Program.cs`, vamos inicializar e definir o sistema de logs:

```csharp
using Serilog; // importe a biblioteca

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

Log.Logger = new LoggerConfiguration() // inicialize o sistema de logs
    .WriteTo.Console() // exibe os logs no console
    .CreateLogger();

builder.Host.UseSerilog(); // Define o Serilog como sistema de logs

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/", () =>
{
    return true;
});

app.Run();
```

Com essa simples configuração já podemos visualizar a geração de logs na janela de saída da aplicação.

![Logs na janela de saída](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/j9fwm8foz1p6xo0w7i5k.png)

Agora precisamos estruturar os logs e definir um padrão para que possamos posteriormente coletar e visualizar esses dados.

Para isso é muito simples: basta adicionar a formatação:

```csharp
Log.Logger = new LoggerConfiguration() // inicialize o sistema de logs
    .WriteTo.Console(new JsonFormatter()) // formata a saída para JSON
    .CreateLogger();
```

Agora os logs estão estruturados em formato JSON:

![Logs estruturados na janela de saída](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dmk13pdiqpjmb49mou7p.png)

Ao estruturar os logs, já dispomos da informação `TraceId`. Essa propriedade permite relacionar os logs de uma mesma requisição. Por exemplo, durante o processamento de uma requisição podemos adicionar logs manualmente, tanto para informação quanto para registrar erros:

```csharp
app.MapGet("/", () =>
{
    try
    {
        Log.Information("Requisição recebida...");
        // Processando requisição...
        Log.Information("Requisição processada...");
        return Results.Ok();
    }
    catch(Exception ex)
    {
        Log.Error($"Ocorreu um erro... {ex}");
    }
    return Results.BadRequest();
});
```

Assim, podemos correlacionar os logs que geramos manualmente (`Log.Information`, `Log.Error` etc.) com os logs da requisição. A requisição também exibirá dados como o payload e o token de autenticação; dessa forma você pode saber exatamente o que o usuário enviou e quem enviou.

Dessa forma simples, temos logs estruturados e prontos para serem visualizados e analisados.

Para mais detalhes, consulte a documentação do [Serilog](https://github.com/serilog/serilog/wiki).

## Configurando o OpenSearch

OpenSearch é uma plataforma open source de busca e análise de dados em tempo real, derivada do Elasticsearch (fork), usada para indexar, armazenar e consultar grandes volumes de logs, métricas e outros dados estruturados ou semiestruturados.

Agora que já temos logs estruturados em JSON, precisamos apenas enviá-los ao OpenSearch. Para isso, iremos precisar de um *sink*.

Cada *sink* define como e onde os logs serão armazenados ou exibidos — por exemplo: console, arquivos, banco de dados ou sistemas de observabilidade (OpenSearch, Elasticsearch, Application Insights etc.).

Configure o *sink* para enviarmos os logs para o OpenSearch:

```csharp
Log.Logger = new LoggerConfiguration() // inicialize o sistema de logs
    .WriteTo.Console(new JsonFormatter()) // exibe os logs no console e formata a saída para JSON
    .WriteTo.OpenSearch(new OpenSearchSinkOptions(new Uri("http://opensearch:9200")) // envia os logs para o OpenSearch
    {
        IndexFormat = "dotnet-logs-{0:yyyy.MM.dd}",
        CustomFormatter = new JsonFormatter() // formata os logs enviados ao OpenSearch no formato JSON
    })
    .CreateLogger();
```

Com isso, precisamos configurar o OpenSearch e o OpenSearch Dashboards (visualizador dos dados). Podemos subir containers com a API, o OpenSearch e o OpenSearch Dashboards:

```yaml
services:
  api:
    build: .
    container_name: dotnet-api
    environment:
      - DOTNET_ENVIRONMENT=Development
    ports:
      - "5000:8080"
    depends_on:
      - opensearch

  opensearch:
    image: opensearchproject/opensearch:3.2.0
    container_name: opensearch
    environment:
      - discovery.type=single-node
      - DISABLE_INSTALL_DEMO_CONFIG=true
      - plugins.security.disabled=true
    ports:
      - "9200:9200"
    

  dashboards:
    image: opensearchproject/opensearch-dashboards:3.2.0
    container_name: opensearch-dashboards
    environment:
       - OPENSEARCH_HOSTS=http://opensearch:9200
       - DISABLE_SECURITY_DASHBOARDS_PLUGIN=true
    ports:
      - "5601:5601"
    depends_on:
      - opensearch
```

Agora basta rodar o comando `docker compose up -d` e teremos nossa infraestrutura online.

Os últimos passos para configurar os logs:

1. Acesse a API para criarmos o índice: `http://localhost:5000/`.
2. Acesse o OpenSearch Dashboards: `http://localhost:5601/`.

![OpenSearch Dashboards > Discover](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/94m8ineegf30zbm6deoj.png)

![Crie o índice](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fe115qhqdbun6wz1beaw.png)

![Informe o nome do índice](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/b6yrqtxbkjqgiic7pa7r.png)

![Selecione TimeStamp, crie o data view](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/p51rs8kyeii0yi8a8w6a.png)

Vá novamente em OpenSearch Dashboards → Discover e você poderá visualizar os logs gerados pela API:

![Visualização dos logs](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/60xn8725jlyyxbfy3bbo.png)

Com isso, finalizamos o desenvolvimento sobre o primeiro pilar: logs.

## Configurando observabilidade na prática — Métricas

Para este pilar, usaremos OpenTelemetry para coletar e exportar as métricas, Prometheus para armazenar os dados e Grafana para visualização.

Iniciando o desenvolvimento, instale os pacotes abaixo:

```
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
dotnet add package OpenTelemetry.Exporter.Prometheus.AspNetCore
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

Para coletar as métricas com OpenTelemetry é bem simples:

```csharp
#region metricas
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation() // coleta dados de requisições automaticamente
        .AddPrometheusExporter()); // exportar as métricas para o Prometheus
#endregion


builder.Host.UseSerilog(); // Defina o Serilog como sistema de logs

var app = builder.Build();

app.MapPrometheusScrapingEndpoint(); // Disponibiliza o endpoint /metrics e coleta as métricas

```

Com isso, temos algumas métricas, como:

- Número de requisições que chegam à nossa API
- Quais endpoints receberam requisições e quantas
- Duração média das requisições
- Quantidade de erros 4xx e 5xx

Podemos acessar o endpoint `/metrics` (`http://localhost:5000/metrics`) para verificar se as métricas estão sendo coletadas normalmente.

![imagem das métricas no endpoint /metrics](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1uehmofbnxh7xmkp20ek.png)

Para configurar o Prometheus, precisamos criar um arquivo `prometheus.yml` e adicionar o código abaixo:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'dotnet-api'
    static_configs:
      - targets: ['api:8080']
    metrics_path: '/metrics'
    scrape_interval: 5s
```

E adicionar o Prometheus e o Grafana no arquivo `docker-compose`:

```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  depends_on:
      - api

grafana:
  image: grafana/grafana:latest
  container_name: grafana
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
    - GF_SECURITY_ADMIN_USER=admin
  depends_on:
      - prometheus
```

Com isso, podemos acessar o Grafana para visualizar as métricas.

Configuração básica:

1. Acesse o [Grafana](http://localhost:3000).
2. Conecte o Prometheus ao Grafana:
Data Sources > Add new Data Source > Prometheus > Prometheus server url: http://prometheus:9090 > Save & Test.
3. Importe um dashboard pré-configurado:

![Imagem tela principal do Grafana](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/h42rkpvj55ky2e392x72.png)

![Imagem importando um dashboard via código](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/nmo4561mw56ut5gjjwpt.png)

O código do dashboard pode ser encontrado [aqui](https://github.com/Vini-Verse/Observability/blob/master/Observability/dashboard.json).

Agora podemos ver as métricas em tempo real:

![Métricas da API](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ii9is59lu47ko2elae69.png)

Podemos também adicionar métricas customizadas, conforme a documentação do [OpenTelemetry](https://opentelemetry.io/docs/languages/dotnet/metrics/getting-started-prometheus-grafana/).

Com isso, finalizamos o segundo pilar da observabilidade: métricas.

## Configurando observabilidade na prática — Traces

Para configurar o rastreamento é tão simples quanto as métricas. Basta adicionar o código abaixo:

```csharp
#region metricas
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: builder.Environment.ApplicationName))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation() // coleta dados de requisições automaticamente
        .AddPrometheusExporter()) // exporta as métricas para o Prometheus
#endregion
#region traces
    .WithTracing(traces => traces
        .AddAspNetCoreInstrumentation() // coleta dados de requisições automaticamente
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("http://collector:4317"); // exporta os dados para o Grafana Tempo
            options.Protocol = OtlpExportProtocol.Grpc;
        }));
#endregion
```

Crie um arquivo `.yml` para configurar o OpenTelemetry Collector, responsável por coletar os traces e exportar para o Grafana Tempo (`otel-collector-config.yml`):

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

exporters:
  logging:
    loglevel: info    
  otlp:
    endpoint: tempo:4317
    tls:
        insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [logging, otlp]
```

Crie um arquivo para configurar o Grafana Tempo (`tempo.yml`):

```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
            endpoint: 0.0.0.0:4317
        http:

storage:
  trace:
    backend: local
    local:
      path: /var/tempo/traces
    wal:
      path: /var/tempo/wal
```

E, por fim, vamos adicionar as imagens do Grafana Tempo e do Collector ao `docker-compose.yml`:

```yaml
tempo:
  image: grafana/tempo:latest
  container_name: tempo
  command: ["-config.file=/etc/tempo/tempo.yml"]
  volumes:
    - ./tempo.yml:/etc/tempo/tempo.yml
    - ./data/tempo:/var/tempo
collector:
  image: otel/opentelemetry-collector-contrib:0.81.0
  container_name: collector
  command: [ "--config=/etc/collector.yml" ]
  ports:
      - "4317:4317"
  volumes:
      - ./otel-collector-config.yml:/etc/collector.yml
  depends_on:
      - tempo
```

Pronto: ambiente configurado. Agora podemos seguir os próximos passos para observar os traces:

1. Acesse a [API](http://localhost:5000) para gerar traces.
2. Acesse o [Grafana](http://localhost:3000).
3. Menu lateral esquerdo → Connections → Add New connection → pesquise por Tempo e selecione → Add new data source → URL: `http://tempo:3200` → desça até o final da página e clique em "Save & Test" → a mensagem abaixo deve ser exibida:

![Sucesso ao criar novo data source (tempo)](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/s0l2eflk8ofba5304dp6.png)

4. Clique em Explore view → Search → Serão listados todos os traces coletados até o momento.

Pronto: agora temos os três pilares configurados e prontos para serem utilizados.

## Dicas

1. Podemos relacionar os traces com os logs através do **TraceId**. Basta copiá‑lo de qualquer trace e buscá‑lo no OpenSearch Dashboards; dessa forma, serão exibidos todos os logs relacionados a esse trace.

2. Podemos adicionar toda uma exceção (exception) em um trace. Para isso, é preciso fazer algumas pequenas alterações:

Adicione uma `source` nas métricas:

```csharp
#region traces
    .WithTracing(traces => traces
        .AddSource("Observability")
        .AddAspNetCoreInstrumentation() // coleta dados de requisições automaticamente
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("http://collector:4317"); // exporta os dados para o Grafana Tempo
            options.Protocol = OtlpExportProtocol.Grpc;
        }));
#endregion
```

Crie um endpoint para simularmos um erro:

```csharp
app.MapGet("Traces/Exception", () =>
{
    var activitySource = new ActivitySource("Observability");
    using var activity = activitySource.StartActivity("Traces.Exception");
    try
    {
        throw new Exception("ocorreu um erro inesperado...");
    }
    catch (Exception ex)
    {
        activity?.AddException(ex);
        return Results.Problem(statusCode: 500, detail: ex.Message);
    }
});
```

O parâmetro passado no construtor de `ActivitySource` deve ter o mesmo nome da `Source` informada anteriormente.

O método `AddException()` irá adicionar os dados da exceção, como mensagem de erro e *stack trace*.

![Imagem do codigo fonte](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/cu333uofhq7lt0u7lo3c.png)

> Lembre-se: este artigo aborda somente as configurações básicas para observabilidade. Existem inúmeros recursos que ainda podem ser adicionados. Consulte a documentação do [OpenTelemetry](https://opentelemetry.io/docs/languages/dotnet/) e do [Serilog](https://github.com/serilog/serilog/wiki) para mais detalhes.

## Conclusão
A observabilidade não é um complemento, mas um requisito essencial para qualquer sistema moderno e distribuído. Logs, métricas e traces formam o núcleo de um ecossistema que permite entender o comportamento interno das aplicações, identificar anomalias rapidamente e agir com precisão antes que os problemas afetem os usuários finais.
Ao implementar ferramentas como Serilog, OpenTelemetry, Prometheus, Grafana e OpenSearch, conseguimos alcançar uma visão clara do estado da aplicação e das suas interações. 
A observabilidade fornece o contexto necessário para diagnosticar falhas complexas, otimizar desempenho e garantir resiliência.
Sistemas observáveis não apenas ajudam a detectar falhas, mas também aceleram o aprendizado sobre o sistema como um todo. E, em um cenário cada vez mais orientado por microsserviços e infraestrutura distribuída, compreender o que acontece em cada parte da aplicação se torna o diferencial entre reagir ao caos e antecipar‑se a ele.
Lembre-se também que a observabilidade não é um recurso exclusivo de microsserviços; ela também pode (e deve) ser utilizada em monólitos. Portanto, se sua API é um monólito, não se preocupe — a observabilidade também irá atendê-lo. Acesse o código-fonte com todos os detalhes [aqui](https://github.com/Vini-Verse/Observability).
